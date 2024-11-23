import { exec } from 'child_process';

const processes = [];

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { command } = req.body;

    // Clear existing processes when a new session starts
    processes.forEach(proc => proc.kill());
    processes.length = 0;

    const process = exec(`zsh -c "${command}"`, (error, stdout, stderr) => { // Changed bash to zsh
      if (error) {
        return res.status(500).json({ error: `Execution failed: ${error.message}` });
      }
      if (stderr) {
        return res.status(500).json({ error: `stderr: ${stderr}` });
      }
      res.status(200).json({ result: stdout });
    });

    // Store the spawned process so we can kill it later if needed
    processes.push(process);

    process.on('close', (code) => {
      console.log(`Process exited with code ${code}`);
    });

  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
