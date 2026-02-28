const fs = require('fs');
const { spawnSync } = require('child_process');

const filePath = process.argv[2];
const envName = process.argv[3];

if (!filePath || !envName) {
    console.error('Usage: node set_convex_env.js <path_to_json> <env_name>');
    process.exit(1);
}

try {
    const jsonContent = fs.readFileSync(filePath, 'utf8');
    console.log(`Setting ${envName} from ${filePath}...`);

    // Using spawnSync with shell: true for npx on Windows
    // Passing the content as a direct argument
    const result = spawnSync('npx.cmd', ['convex', 'env', 'set', envName, jsonContent], {
        shell: false,
        stdio: 'inherit'
    });

    if (result.status !== 0) {
        throw new Error(`Process exited with status ${result.status}`);
    }
    console.log('Successfully set variable.');
} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}
