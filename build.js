const fs = require('fs/promises');

async function build()
{
    const username = process.env.GITHUB_ACTOR;
    const token = process.env.GITHUB_TOKEN;
    const headers =
    {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    console.log(`Récupération des dépôts pour ${username}...`);
  
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers });
    const repos = await reposRes.json();

    const projects = [];

    for (const repo of repos)
    {
        if (repo.fork)
          continue;

        let readmeContent = null;
        const readmeRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, { headers });
        
        if (readmeRes.ok)
        {
            const readmeData = await readmeRes.json();
            readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
        }

        projects.push({
            name: repo.name,
            url: repo.html_url,
            description: repo.description,
            readme: readmeContent
        });
    }
    await fs.mkdir('public', { recursive: true });
    await fs.writeFile('public/data.json', JSON.stringify(projects));
    await fs.copyFile('index.html', 'public/index.html');
    
    console.log('Build terminé avec succès !');
}

build();
