#!/usr/bin/env node

/**
 * Comprehensive API Route Tracking Migration Script
 * 
 * This script migrates ALL API routes in the application to include tracking.
 */

const fs = require('fs')
const path = require('path')

class ComprehensiveAPIMigrator {
  constructor(apiDir, dryRun = true) {
    this.apiDir = apiDir
    this.dryRun = dryRun
  }

  /**
   * Find all API route files
   */
  async findRouteFiles() {
    const files = this.findFilesRecursively(this.apiDir, 'route.ts')
    
    const routeFiles = []
    
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const methods = this.extractMethods(content)
      const hasTracking = this.hasTracking(content)
      const routeType = this.determineRouteType(filePath)
      
      routeFiles.push({
        path: filePath,
        content,
        hasTracking,
        methods,
        routeType
      })
    }
    
    return routeFiles
  }

  /**
   * Recursively find files with specific name
   */
  findFilesRecursively(dir, filename) {
    const files = []
    
    try {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          files.push(...this.findFilesRecursively(fullPath, filename))
        } else if (item === filename) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files
  }

  /**
   * Extract HTTP methods from route file
   */
  extractMethods(content) {
    const methods = []
    const methodRegex = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/g
    let match
    
    while ((match = methodRegex.exec(content)) !== null) {
      methods.push(match[1])
    }
    
    return methods
  }

  /**
   * Check if file already has tracking
   */
  hasTracking(content) {
    return content.includes('trackGET') || 
           content.includes('trackPOST') || 
           content.includes('trackPUT') || 
           content.includes('trackDELETE') || 
           content.includes('trackPATCH') ||
           content.includes('createTrackedHandlers')
  }

  /**
   * Determine route type based on path
   */
  determineRouteType(filePath) {
    if (filePath.includes('/webhooks/')) return 'webhook'
    if (filePath.includes('/reports/')) return 'report'
    if (filePath.includes('/applications/')) return 'application'
    if (filePath.includes('/tenants/')) return 'tenant'
    return 'core'
  }

  /**
   * Get appropriate tracking options for route type
   */
  getTrackingOptions(routeType) {
    switch (routeType) {
      case 'webhook':
        return 'TRACKING_OPTIONS.WEBHOOK'
      case 'report':
        return 'TRACKING_OPTIONS.HIGH_FREQUENCY'
      case 'core':
      case 'tenant':
      case 'application':
      default:
        return 'TRACKING_OPTIONS.DEFAULT'
    }
  }

  /**
   * Generate migration report
   */
  generateMigrationReport(routeFiles) {
    console.log('🔍 Comprehensive API Route Migration Analysis\n')
    
    const totalFiles = routeFiles.length
    const filesWithTracking = routeFiles.filter(f => f.hasTracking).length
    const filesNeedingMigration = totalFiles - filesWithTracking
    
    console.log(`📊 Summary:`)
    console.log(`   Total API route files: ${totalFiles}`)
    console.log(`   Already have tracking: ${filesWithTracking}`)
    console.log(`   Need migration: ${filesNeedingMigration}\n`)
    
    // Group by route type
    const byType = routeFiles.reduce((acc, file) => {
      acc[file.routeType] = (acc[file.routeType] || 0) + 1
      return acc
    }, {})
    
    console.log(`📁 Route Types:`)
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} files`)
    })
    console.log('')
    
    if (filesNeedingMigration === 0) {
      console.log('✅ All API routes already have tracking!')
      return
    }
    
    console.log('📝 Migration Plan:\n')
    
    routeFiles
      .filter(f => !f.hasTracking)
      .forEach(file => {
        const trackingOptions = this.getTrackingOptions(file.routeType)
        console.log(`📄 ${path.relative(this.apiDir, file.path)}`)
        console.log(`   Type: ${file.routeType}`)
        console.log(`   Methods: ${file.methods.join(', ')}`)
        console.log(`   Tracking: ${trackingOptions}`)
        console.log('')
      })
  }

  /**
   * Run the migration
   */
  async run() {
    console.log('🚀 Starting Comprehensive API Route Tracking Migration\n')
    
    const routeFiles = await this.findRouteFiles()
    
    if (this.dryRun) {
      this.generateMigrationReport(routeFiles)
      console.log('💡 Run with --execute flag to apply changes')
    } else {
      console.log('⚠️  Executing migration...\n')
      
      let successCount = 0
      let errorCount = 0
      
      for (const file of routeFiles.filter(f => !f.hasTracking)) {
        try {
          let newContent = file.content
          
          // Add import for tracking wrappers
          if (!newContent.includes('api-tracking-wrappers')) {
            const methods = file.methods
            const imports = methods.map(method => `track${method}`)
            if (methods.length > 3) {
              imports.push('createTrackedHandlers')
            }
            const importLine = `import { ${imports.join(', ')}, TRACKING_OPTIONS } from '@/lib/api-tracking-wrappers'\n`
            
            const lines = newContent.split('\n')
            const lastImportIndex = lines.findLastIndex(line => 
              line.startsWith('import ') || line.startsWith("import ")
            )
            
            if (lastImportIndex >= 0) {
              lines.splice(lastImportIndex + 1, 0, importLine)
            } else {
              lines.unshift(importLine)
            }
            newContent = lines.join('\n')
          }
          
          // Migrate each method
          for (const method of file.methods) {
            const methodRegex = new RegExp(
              `export\\s+(?:async\\s+)?function\\s+${method}\\s*\\(([^)]*)\\)\\s*{`,
              'g'
            )
            
            newContent = newContent.replace(methodRegex, (match, params) => {
              return `export const ${method} = track${method}(async (${params}) => {`
            })
            
            // Add tracking options
            const trackingOptions = this.getTrackingOptions(file.routeType)
            const endRegex = new RegExp(
              `(export const ${method} = track${method}\\(async \\([^)]*\\) => \\{[\\s\\S]*?\\})\\)`,
              'g'
            )
            
            newContent = newContent.replace(endRegex, (match) => {
              return match.replace(/}\)$/, `}, ${trackingOptions})`)
            })
          }
          
          fs.writeFileSync(file.path, newContent)
          console.log(`✅ Migrated: ${path.relative(this.apiDir, file.path)} (${file.routeType})`)
          successCount++
        } catch (error) {
          console.error(`❌ Failed to migrate ${file.path}:`, error)
          errorCount++
        }
      }
      
      console.log(`\n🎉 Migration completed!`)
      console.log(`   ✅ Success: ${successCount}`)
      console.log(`   ❌ Errors: ${errorCount}`)
    }
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2)
  const dryRun = !args.includes('--execute')
  const apiDir = path.join(process.cwd(), 'src/app/api')
  
  const migrator = new ComprehensiveAPIMigrator(apiDir, dryRun)
  await migrator.run()
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { ComprehensiveAPIMigrator }
