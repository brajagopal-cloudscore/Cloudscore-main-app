export const storage = {
  // Use Case operations
  saveUseCase: (useCase: any) => {
    try {
      localStorage.setItem("useCase", JSON.stringify(useCase))
      return true
    } catch (error) {
      console.error("Failed to save use case:", error)
      return false
    }
  },

  loadUseCase: () => {
    try {
      const stored = localStorage.getItem("useCase")
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error("Failed to load use case:", error)
      return null
    }
  },

  removeUseCase: () => {
    try {
      localStorage.removeItem("useCase")
      return true
    } catch (error) {
      console.error("Failed to remove use case:", error)
      return false
    }
  },

  // Risks operations
  saveRisks: (risks: any[]) => {
    try {
      localStorage.setItem("risks", JSON.stringify(risks))
      return true
    } catch (error) {
      console.error("Failed to save risks:", error)
      return false
    }
  },

  loadRisks: () => {
    try {
      const stored = localStorage.getItem("risks")
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to load risks:", error)
      return []
    }
  },

  // Check if high risk exists
  hasHighRisk: () => {
    try {
      const risks = storage.loadRisks()
      return risks.some((risk: any) => risk.riskLevel === "high risk")
    } catch (error) {
      console.error("Failed to check high risk:", error)
      return false
    }
  },

  // Clear all data
  clearAll: () => {
    try {
      localStorage.removeItem("useCase")
      localStorage.removeItem("risks")
      return true
    } catch (error) {
      console.error("Failed to clear storage:", error)
      return false
    }
  },
}
