import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

// Sanitize commands for safety
const ALLOWED_COMMANDS = [
  'openclaw',
  'ls',
  'pwd',
  'cd',
  'cat',
  'echo',
  'clear',
  'help',
  'which',
  'whoami',
  'date',
  'ps',
  'top',
  'htop',
  'df',
  'du',
  'grep',
  'head',
  'tail',
  'wc',
  'find',
  'mkdir',
  'touch',
  'rm',
  'cp',
  'mv',
  'git',
  'npm',
  'node',
  'python',
  'python3',
  'docker',
  'docker-compose',
  'kubectl',
  'helm',
  'curl',
  'wget',
  'ping',
  'traceroute',
  'nslookup',
  'dig',
  'ssh',
  'scp',
  'rsync',
  'tar',
  'gzip',
  'gunzip',
  'zip',
  'unzip',
  'vim',
  'nvim',
  'code',
];

function sanitizeCommand(cmd: string): { safe: boolean; command: string; args: string[] } {
  const parts = cmd.trim().split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);
  
  // Check if command is in allowlist
  const isAllowed = ALLOWED_COMMANDS.some(allowed => 
    command === allowed || command.endsWith('/' + allowed)
  );
  
  // Block dangerous patterns
  const dangerousPatterns = [
    /;\s*rm\s+-rf/i,
    />\s*\/dev\//i,
    /curl.*\|.*sh/i,
    /wget.*\|.*sh/i,
    /:\(\)\s*\{\s*:\|:\s*\&/i, // Fork bomb
    /eval\s*\(/i,
    /exec\s*\(/i,
  ];
  
  const hasDangerous = dangerousPatterns.some(pattern => pattern.test(cmd));
  
  return {
    safe: isAllowed && !hasDangerous,
    command,
    args,
  };
}

// POST /api/terminal - Execute command
export async function POST(request: Request) {
  try {
    const { command, cwd } = await request.json();
    
    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Command required' },
        { status: 400 }
      );
    }
    
    const sanitized = sanitizeCommand(command);
    
    if (!sanitized.safe) {
      return NextResponse.json({
        stdout: '',
        stderr: `Command not allowed: ${sanitized.command}\nAllowed: ${ALLOWED_COMMANDS.join(', ')}`,
        exitCode: 1,
      });
    }
    
    // Special handling for openclaw commands
    if (sanitized.command === 'openclaw' || sanitized.command.endsWith('openclaw')) {
      try {
        const { stdout, stderr } = await execAsync(command, {
          cwd: cwd || process.env.HOME,
          timeout: 30000,
          env: {
            ...process.env,
            PATH: '/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:' + process.env.PATH,
          },
        });
        
        return NextResponse.json({
          stdout: stdout || 'Command executed successfully',
          stderr: stderr || '',
          exitCode: 0,
        });
      } catch (execError: any) {
        return NextResponse.json({
          stdout: execError.stdout || '',
          stderr: execError.stderr || execError.message,
          exitCode: execError.code || 1,
        });
      }
    }
    
    // Execute other safe commands
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: cwd || process.env.HOME,
        timeout: 30000,
        env: {
          ...process.env,
          PATH: '/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:' + process.env.PATH,
        },
      });
      
      return NextResponse.json({
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: 0,
      });
    } catch (execError: any) {
      return NextResponse.json({
        stdout: execError.stdout || '',
        stderr: execError.stderr || execError.message,
        exitCode: execError.code || 1,
      });
    }
  } catch (error) {
    console.error('Terminal API error:', error);
    return NextResponse.json(
      { error: 'Failed to execute command' },
      { status: 500 }
    );
  }
}

// GET /api/terminal - Get shell info
export async function GET() {
  try {
    const { stdout: shell } = await execAsync('echo $SHELL');
    const { stdout: home } = await execAsync('echo $HOME');
    const { stdout: user } = await execAsync('whoami');
    
    return NextResponse.json({
      shell: shell.trim().split('/').pop() || 'zsh',
      home: home.trim(),
      user: user.trim(),
      cwd: process.cwd(),
    });
  } catch (error) {
    return NextResponse.json({
      shell: 'zsh',
      home: process.env.HOME || '/Users/adler',
      user: 'adler',
      cwd: process.cwd(),
    });
  }
}
