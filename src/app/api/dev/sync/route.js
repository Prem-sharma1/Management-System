import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { assignTasksAndDeliveries } from '../assign-tasks/route';

export const dynamic = 'force-dynamic';

function runCmd(cmd, cwd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function extractDeliveriesTsv(projectRoot) {
  try {
    const logFilePath = 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\fba2d913-702b-4793-95c7-948f5bf55330\\.system_generated\\logs\\transcript_full.jsonl';
    const targetTsvPath = path.join(projectRoot, 'prisma', 'deliveries.tsv');

    if (!fs.existsSync(logFilePath)) {
      return "Log file not found at " + logFilePath;
    }

    const fileContent = fs.readFileSync(logFilePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    
    // Find the last line that has USER_INPUT type
    let userRequestLine = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineData = JSON.parse(lines[i]);
      if (lineData.type === 'USER_INPUT') {
        userRequestLine = lineData;
        break;
      }
    }
    
    if (!userRequestLine) {
      return "Could not find USER_INPUT line in log.";
    }

    const content = userRequestLine.content;
    const match = content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
    if (!match) {
      return "Could not find <USER_REQUEST> tags.";
    }

    const rawRequestText = match[1].trim();
    const tsvStartIdx = rawRequestText.indexOf("Delivery ID\tClient ID");
    if (tsvStartIdx === -1) {
      return "Could not find Delivery ID header in user request.";
    }

    let tsvData = rawRequestText.substring(tsvStartIdx);
    const instructionIdx = tsvData.indexOf("here is my data please store it on my prisma datase and see it on page as per dta make pages in admin");
    if (instructionIdx !== -1) {
      tsvData = tsvData.substring(0, instructionIdx).trim();
    }

    fs.writeFileSync(targetTsvPath, tsvData, 'utf8');
    return `Successfully extracted TSV data to ${targetTsvPath}`;
  } catch (err) {
    return `Extraction failed: ${err.message || err}`;
  }
}

export async function GET() {
  const projectRoot = path.resolve(process.cwd());
  const logs = [];

  try {
    logs.push("Extracting campaigns deliveries TSV dataset...");
    const extLog = extractDeliveriesTsv(projectRoot);
    logs.push(extLog);

    logs.push("Starting database schema push...");
    // 1. Run prisma db push to sync the Postgres tables
    const pushResult = await runCmd("npx prisma db push --force-reset", projectRoot);
    logs.push("Schema push success:", pushResult.stdout);

    logs.push("Generating updated Prisma client...");
    // 1b. Run prisma generate to update generated model typings in node_modules
    const generateResult = await runCmd("npx prisma generate", projectRoot);
    logs.push("Client generation success:", generateResult.stdout);

    logs.push("Starting database seeding...");
    // 2. Run seed script to import all clients, tasks, and deliveries
    const seedResult = await runCmd("node prisma/seed.js", projectRoot);
    logs.push("Database seeding success:", seedResult.stdout);

    logs.push("Running employee daily task assignment rotation...");
    const rotationStats = await assignTasksAndDeliveries();
    logs.push(`Rotation success! Assigned ${rotationStats.tasksCount} tasks and ${rotationStats.deliveriesCount} deliveries.`);

    return NextResponse.json({
      success: true,
      message: "Database tables updated, generated, data seeded, and employee tasks rotated successfully!",
      logs,
      rotationStats
    });
  } catch (err) {
    console.error("Database auto-sync error:", err);
    return NextResponse.json({
      success: false,
      message: "Database sync encountered an error.",
      error: err.error?.message || err,
      stdout: err.stdout,
      stderr: err.stderr,
      logs
    }, { status: 200 });
  }
}
