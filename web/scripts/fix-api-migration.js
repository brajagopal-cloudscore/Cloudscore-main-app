#!/usr/bin/env node

/**
 * Fix API Route Migration Issues
 * 
 * This script fixes common issues from the migration script.
 */

const fs = require('fs')
const path = require('path')

function fixRouteFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8')
    let modified = false
    
    // Fix: Remove TRACKING_OPTIONS from NextResponse.json calls
    content = content.replace(/, TRACKING_OPTIONS\.\w+\)/g, ')')
    
    // Fix: Remove TRACKING_OPTIONS from database queries
    content = content.replace(/, TRACKING_OPTIONS\.\w+\)/g, ')')
    
    // Fix: Ensure proper closing with tracking options
    if (content.includes('trackGET') || content.includes('trackPOST') || content.includes('trackPUT') || content.includes('trackDELETE') || content.includes('trackPATCH')) {
      // Find the last closing brace and add tracking options
      const lines = content.split('\n')
      const lastBraceIndex = lines.findLastIndex(line => line.trim() === '}')
      
      if (lastBraceIndex >= 0 && !lines[lastBraceIndex].includes('TRACKING_OPTIONS')) {
        // Determine tracking options based on file path
        let trackingOptions = 'TRACKING_OPTIONS.DEFAULT'
        if (filePath.includes('/webhooks/')) {
          trackingOptions = 'TRACKING_OPTIONS.WEBHOOK'
        } else if (filePath.includes('/reports/')) {
          trackingOptions = 'TRACKING_OPTIONS.HIGH_FREQUENCY'
        }
        
        lines[lastBraceIndex] = `}, ${trackingOptions})`
        content = lines.join('\n')
        modified = true
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content)
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`)
    }
  } catch (error) {
    console.error(`❌ Failed to fix ${filePath}:`, error)
  }
}

function findRouteFiles(dir) {
  const files = []
  
  try {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        files.push(...findRouteFiles(fullPath))
      } else if (item === 'route.ts') {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return files
}

// Main execution
const apiDir = path.join(process.cwd(), 'src/app/api')
const routeFiles = findRouteFiles(apiDir)

console.log('🔧 Fixing API Route Migration Issues...\n')

routeFiles.forEach(fixRouteFile)

console.log('\n🎉 Fix completed!')
