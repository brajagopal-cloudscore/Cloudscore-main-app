#!/usr/bin/env node

/**
 * API Route Tracking Migration Script
 * 
 * This script helps migrate existing Next.js API routes to include tracking.
 * It can automatically update route files or provide migration suggestions.
 */

import fs from 'fs'
import path from 'path'
import { readdirSync, statSync } from 'fs'

interface RouteFile {
  path: string
  content: string
  hasTracking: boolean
  methods: string[]
}

class APIRouteMigrator {
  private apiDir: string
  private dryRun: boolean

  constructor(apiDir: string, dryRun: boolean = true) {
    this.apiDir = apiDir
    this.dryRun = dryRun
  }

  /**
   * Find all API route files
   */
  async findRouteFiles(): Promise<RouteFile[]> {
    const files = this.findFilesRecursively(this.apiDir, 'route.ts')
    
    const routeFiles: RouteFile[] = []
    
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const methods = this.extractMethods(content)
      const hasTracking = this.hasTracking(content)
      
      routeFiles.push({
        path: filePath,
        content,
        hasTracking,
        methods
      })
    }
    
    return routeFiles
  }

  /**
   * Recursively find files with specific name
   */
  private findFilesRecursively(dir: string, filename: string): string[] {
    const files: string[] = []
    
    try {
      const items = readdirSync(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = statSync(fullPath)
        
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
  private extractMethods(content: string): string[] {
    const methods: string[] = []
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
  private hasTracking(content: string): boolean {
    return content.includes('trackGET') || 
           content.includes('trackPOST') || 
           content.includes('trackPUT') || 
           content.includes('trackDELETE') || 
           content.includes('trackPATCH') ||
           content.includes('createTrackedHandlers')
  }

  /**
   * Generate migration suggestions
   */
  generateMigrationSuggestions(routeFiles: RouteFile[]): void {
    console.log('🔍 API Route Migration Analysis\n')
    
    const totalFiles = routeFiles.length
    const filesWithTracking = routeFiles.filter(f => f.hasTracking).length
    const filesNeedingMigration = totalFiles - filesWithTracking
    
    console.log(`📊 Summary:`)
    console.log(`   Total API route files: ${totalFiles}`)
    console.log(`   Already have tracking: ${filesWithTracking}`)
    console.log(`   Need migration: ${filesNeedingMigration}\n`)
    
    if (filesNeedingMigration === 0) {
      console.log('✅ All API routes already have tracking!')
      return
    }
    
    console.log('📝 Migration Suggestions:\n')
    
    routeFiles
      .filter(f => !f.hasTracking)
      .forEach(file => {
        console.log(`📄 ${path.relative(this.apiDir, file.path)}`)
        console.log(`   Methods: ${file.methods.join(', ')}`)
        console.log(`   Suggested approach: ${this.getSuggestedApproach(file)}`)
        console.log('')
      })
  }

  /**
   * Get suggested migration approach for a file
   */
  private getSuggestedApproach(file: RouteFile): string {
    if (file.methods.length === 1) {
      return `Use track${file.methods[0]} wrapper`
    } else if (file.methods.length <= 3) {
      return `Use individual track${file.methods.join(', track')} wrappers`
    } else {
      return `Use createTrackedHandlers for all methods`
    }
  }

  /**
   * Migrate a single route file
   */
  async migrateRouteFile(file: RouteFile): Promise<string> {
    const { content, methods } = file
    
    if (methods.length === 0) {
      return content // No HTTP methods found
    }
    
    let newContent = content
    
    // Add import for tracking wrappers
    if (!newContent.includes('api-tracking-wrappers')) {
      const importLine = `import { ${this.getImportNames(methods)}, TRACKING_OPTIONS } from '@/lib/api-tracking-wrappers'\n`
      newContent = this.addImport(newContent, importLine)
    }
    
    // Migrate each method
    for (const method of methods) {
      newContent = this.migrateMethod(newContent, method)
    }
    
    return newContent
  }

  /**
   * Get import names needed for methods
   */
  private getImportNames(methods: string[]): string {
    const imports = methods.map(method => `track${method}`)
    
    if (methods.length > 3) {
      imports.push('createTrackedHandlers')
    }
    
    return imports.join(', ')
  }

  /**
   * Add import statement
   */
  private addImport(content: string, importLine: string): string {
    const lines = content.split('\n')
    const lastImportIndex = lines.findLastIndex(line => 
      line.startsWith('import ') || line.startsWith("import ")
    )
    
    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, importLine)
    } else {
      lines.unshift(importLine)
    }
    
    return lines.join('\n')
  }

  /**
   * Migrate a single HTTP method
   */
  private migrateMethod(content: string, method: string): string {
    const methodRegex = new RegExp(
      `export\\s+(?:async\\s+)?function\\s+${method}\\s*\\(([^)]*)\\)\\s*{`,
      'g'
    )
    
    return content.replace(methodRegex, (match, params) => {
      return `export const ${method} = track${method}(async (${params}) => {`
    })
  }

  /**
   * Run the migration
   */
  async run(): Promise<void> {
    console.log('🚀 Starting API Route Tracking Migration\n')
    
    const routeFiles = await this.findRouteFiles()
    
    if (this.dryRun) {
      this.generateMigrationSuggestions(routeFiles)
      console.log('💡 Run with --execute flag to apply changes')
    } else {
      console.log('⚠️  Executing migration...\n')
      
      for (const file of routeFiles.filter(f => !f.hasTracking)) {
        try {
          const newContent = await this.migrateRouteFile(file)
          
          fs.writeFileSync(file.path, newContent)
          console.log(`✅ Migrated: ${path.relative(this.apiDir, file.path)}`)
        } catch (error) {
          console.error(`❌ Failed to migrate ${file.path}:`, error)
        }
      }
      
      console.log('\n🎉 Migration completed!')
    }
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2)
  const dryRun = !args.includes('--execute')
  const apiDir = path.join(process.cwd(), 'src/app/api')
  
  const migrator = new APIRouteMigrator(apiDir, dryRun)
  await migrator.run()
}

if (require.main === module) {
  main().catch(console.error)
}

export { APIRouteMigrator }
