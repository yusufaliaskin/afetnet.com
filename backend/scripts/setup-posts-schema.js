import { supabaseAdmin } from '../lib/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupPostsSchema() {
  try {
    console.log('Setting up posts schema...');
    
    // Read the posts schema SQL file
    const schemaPath = path.join(__dirname, '../lib/database/posts_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL commands by semicolon and filter out empty commands
    const commands = schemaSql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`Executing ${commands.length} SQL commands...`);
    
    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          console.log(`Executing command ${i + 1}/${commands.length}...`);
          const { error } = await supabaseAdmin.rpc('exec_sql', {
            sql_query: command
          });
          
          if (error) {
            console.error(`Error executing command ${i + 1}:`, error);
            // Continue with other commands
          } else {
            console.log(`Command ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`Error executing command ${i + 1}:`, err.message);
          // Continue with other commands
        }
      }
    }
    
    console.log('Posts schema setup completed!');
    
    // Test if tables were created
    console.log('Testing table creation...');
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('count')
      .limit(1);
      
    if (postsError) {
      console.error('Posts table test failed:', postsError);
    } else {
      console.log('Posts table is accessible!');
    }
    
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupPostsSchema();