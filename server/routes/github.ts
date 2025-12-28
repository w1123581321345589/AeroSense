import { Router } from 'express';
import { getUncachableGitHubClient } from '../lib/github';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

async function getAllFiles(dir: string, baseDir: string = ''): Promise<{path: string, content: string}[]> {
  const files: {path: string, content: string}[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  const ignoreDirs = ['node_modules', '.git', 'static-build', 'dist', 'server_dist', '.expo', '.cache'];
  const ignoreFiles = ['.DS_Store', 'package-lock.json'];
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = baseDir ? `${baseDir}/${entry.name}` : entry.name;
    
    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) {
        const subFiles = await getAllFiles(fullPath, relativePath);
        files.push(...subFiles);
      }
    } else {
      if (!ignoreFiles.includes(entry.name)) {
        try {
          const content = fs.readFileSync(fullPath);
          const isBinary = content.includes(0x00);
          if (!isBinary) {
            files.push({
              path: relativePath,
              content: content.toString('base64')
            });
          }
        } catch (e) {
        }
      }
    }
  }
  return files;
}

router.post('/push-to-repo', async (req, res) => {
  try {
    const { repoName, description } = req.body;
    const octokit = await getUncachableGitHubClient();
    
    const { data: user } = await octokit.users.getAuthenticated();
    
    let repo;
    try {
      const { data } = await octokit.repos.get({
        owner: user.login,
        repo: repoName,
      });
      repo = data;
    } catch (e: any) {
      if (e.status === 404) {
        const { data } = await octokit.repos.createForAuthenticatedUser({
          name: repoName,
          description: description || 'AeroSense - Aviation Air Quality Monitor',
          private: false,
          auto_init: false,
        });
        repo = data;
      } else {
        throw e;
      }
    }
    
    res.json({ 
      success: true, 
      repo: repo.html_url,
      owner: user.login,
      name: repo.name
    });
  } catch (error: any) {
    console.error('GitHub error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/sync-files', async (req, res) => {
  try {
    const { repoName, commitMessage } = req.body;
    const octokit = await getUncachableGitHubClient();
    const { data: user } = await octokit.users.getAuthenticated();
    
    const projectDir = process.cwd();
    const allFiles = await getAllFiles(projectDir);
    
    console.log(`Found ${allFiles.length} files to sync`);
    
    let uploaded = 0;
    let errors: string[] = [];
    
    for (const file of allFiles) {
      try {
        let sha: string | undefined;
        try {
          const { data: existing } = await octokit.repos.getContent({
            owner: user.login,
            repo: repoName,
            path: file.path
          });
          if ('sha' in existing) {
            sha = existing.sha;
          }
        } catch (e) {
        }
        
        await octokit.repos.createOrUpdateFileContents({
          owner: user.login,
          repo: repoName,
          path: file.path,
          message: sha ? `Update ${file.path}` : `Add ${file.path}`,
          content: file.content,
          sha: sha,
          branch: 'main'
        });
        uploaded++;
        console.log(`Uploaded (${uploaded}/${allFiles.length}): ${file.path}`);
      } catch (e: any) {
        errors.push(`${file.path}: ${e.message}`);
        console.error(`Failed to upload ${file.path}: ${e.message}`);
      }
    }
    
    res.json({
      success: true,
      uploaded,
      total: allFiles.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      repo: `https://github.com/${user.login}/${repoName}`
    });
  } catch (error: any) {
    console.error('GitHub sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/user', async (req, res) => {
  try {
    const octokit = await getUncachableGitHubClient();
    const { data: user } = await octokit.users.getAuthenticated();
    res.json({ login: user.login, name: user.name });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
