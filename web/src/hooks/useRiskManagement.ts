import { useState, useCallback } from 'react';
import { ProjectRisk } from '@/types/useCase';

export const useRiskManagement = () => {
  // Risk management state
  const [selectedRiskIds, setSelectedRiskIds] = useState<string[]>([]);
  const [newRisks, setNewRisks] = useState<Array<Partial<ProjectRisk>>>([]);
  const [useAIRiskDatabase, setUseAIRiskDatabase] = useState<{ [key: number]: boolean }>({});
  
  // NEW: Edit mode state
  const [existingRisks, setExistingRisks] = useState<ProjectRisk[]>([]);
  const [updatedRisks, setUpdatedRisks] = useState<ProjectRisk[]>([]);
  const [removedRiskIds, setRemovedRiskIds] = useState<string[]>([]);
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);
  const [originalRiskData, setOriginalRiskData] = useState<{ [key: string]: ProjectRisk }>({});

  // FIXED: Initialize edit risks from use case data
  const initializeEditRisks = useCallback((risks: ProjectRisk[]) => {
    console.log('Initializing risks:', risks);
    setExistingRisks(risks);
    setUpdatedRisks([]);
    setRemovedRiskIds([]);
    setEditingRiskId(null);
    setSelectedRiskIds([]); // Clear selected risk IDs for edit mode
    setNewRisks([]); // Clear new risks for edit mode
    
    // Create backup of original data
    const backup: { [key: string]: ProjectRisk } = {};
    risks.forEach(risk => {
      backup[risk._id] = { ...risk };
    });
    setOriginalRiskData(backup);
  }, []);

  // Reset all risk data
  const resetRisks = useCallback(() => {
    setSelectedRiskIds([]);
    setNewRisks([]);
    setUseAIRiskDatabase({});
    setExistingRisks([]);
    setUpdatedRisks([]);
    setRemovedRiskIds([]);
    setEditingRiskId(null);
    setOriginalRiskData({});
  }, []);

  // Handle existing risk selection (for linking existing risks from database)
  const handleAddExistingRisk = useCallback((risk: ProjectRisk) => {
    if (!selectedRiskIds.includes(risk._id)) {
      setSelectedRiskIds(prev => [...prev, risk._id]);
    }
  }, [selectedRiskIds]);

  const handleRemoveExistingRisk = useCallback((riskId: string) => {
    setSelectedRiskIds(prev => prev.filter(id => id !== riskId));
  }, []);

  // Handle new risk creation
  const handleAddNewRisk = useCallback(() => {
    const newRisk: Partial<ProjectRisk> = {
      sRiskName: '',
      sDescription: '',
      sOwner: '',
      eSeverity: 'Minor',
      eLikelihood: 'Possible',
      eMitigationStatus: 'Not Started',
      eRiskLevel: 'Low',
      dTargetDate: '',
    };
    
    setNewRisks(prev => [...prev, newRisk]);
    setUseAIRiskDatabase(prev => ({ ...prev, [newRisks.length]: false }));
  }, [newRisks.length]);

  const handleUpdateNewRisk = useCallback((index: number, field: string, value: any) => {
    setNewRisks(prev => prev.map((risk, i) => 
      i === index ? { ...risk, [field]: value } : risk
    ));
  }, []);

  const handleRemoveNewRisk = useCallback((index: number) => {
    setNewRisks(prev => prev.filter((_, i) => i !== index));
    setUseAIRiskDatabase(prev => {
      const updated = { ...prev };
      delete updated[index];
      // Reindex remaining items
      const reindexed: { [key: number]: boolean } = {};
      Object.keys(updated).forEach((key, i) => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          reindexed[keyNum - 1] = updated[keyNum];
        } else {
          reindexed[keyNum] = updated[keyNum];
        }
      });
      return reindexed;
    });
  }, []);

  // Toggle AI risk database usage
  const handleToggleAIRiskDatabase = useCallback((index: number) => {
    setUseAIRiskDatabase(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  // FIXED: Edit existing risk handlers
  const handleEditExistingRisk = useCallback((riskId: string) => {
    setEditingRiskId(riskId);
  }, []);

  const handleUpdateExistingRisk = useCallback((riskId: string, field: string, value: any) => {
    // Update the risk in existingRisks array
    setExistingRisks(prev => prev.map(risk => 
      risk._id === riskId ? { ...risk, [field]: value } : risk
    ));

    // FIXED: Track this risk as updated
    setUpdatedRisks(prev => {
      const existingIndex = prev.findIndex(r => r._id === riskId);
      const currentRisk = existingRisks.find(r => r._id === riskId);
      
      if (existingIndex >= 0) {
        // Update existing entry in updatedRisks
        return prev.map((r, i) => 
          i === existingIndex ? { ...r, [field]: value } : r
        );
      } else if (currentRisk) {
        // Add new entry to updatedRisks
        return [...prev, { ...currentRisk, [field]: value }];
      }
      return prev;
    });
  }, [existingRisks]);

  const handleRemoveExistingRiskFromUseCase = useCallback((riskId: string) => {
    // FIXED: Check if this would be the last risk
    const currentActiveRisks = existingRisks.filter(r => !removedRiskIds.includes(r._id));
    const totalRisksAfterRemoval = currentActiveRisks.length - 1 + newRisks.length + selectedRiskIds.length;
    
    if (totalRisksAfterRemoval <= 0) {
      console.warn('Cannot remove last risk');
      return; // Don't allow removal of last risk
    }
    
    // Add to removed list
    setRemovedRiskIds(prev => [...prev, riskId]);
    
    // Remove from updated list if it was being edited
    setUpdatedRisks(prev => prev.filter(r => r._id !== riskId));
    
    // Cancel editing if this risk was being edited
    if (editingRiskId === riskId) {
      setEditingRiskId(null);
    }
  }, [existingRisks, removedRiskIds, newRisks.length, selectedRiskIds.length, editingRiskId]);

  const handleCancelEditRisk = useCallback((riskId: string) => {
    // Restore original data
    const original = originalRiskData[riskId];
    if (original) {
      setExistingRisks(prev => prev.map(risk => 
        risk._id === riskId ? { ...original } : risk
      ));
      
      // Remove from updated list
      setUpdatedRisks(prev => prev.filter(r => r._id !== riskId));
    }
    
    setEditingRiskId(null);
  }, [originalRiskData]);

  const handleSaveEditRisk = useCallback((riskId: string) => {
    setEditingRiskId(null);
    // The risk is already tracked in updatedRisks from handleUpdateExistingRisk
  }, []);

  // FIXED: Get final risk data for submission
  const getFinalRiskData = useCallback(() => {
    return {
      aExistingRiskIds: selectedRiskIds, // For linking new existing risks from database
      aNewRisks: newRisks.filter(risk => 
        risk.sRiskName && risk.sOwner && risk.dTargetDate
      ),
      aUpdatedRisks: updatedRisks.filter(risk => 
        risk.sRiskName && risk.sOwner && risk.dTargetDate
      ),
      aRemovedRiskIds: removedRiskIds
    };
  }, [selectedRiskIds, newRisks, updatedRisks, removedRiskIds]);

  // FIXED: Calculate total risks properly
  const getTotalRiskCount = useCallback(() => {
    const activeExistingRisks = existingRisks.filter(r => !removedRiskIds.includes(r._id));
    return activeExistingRisks.length + newRisks.length + selectedRiskIds.length;
  }, [existingRisks, removedRiskIds, newRisks.length, selectedRiskIds.length]);

  return {
    // State
    selectedRiskIds,
    newRisks,
    useAIRiskDatabase,
    existingRisks,
    updatedRisks,
    removedRiskIds,
    editingRiskId,
    
    // Basic handlers
    handleAddExistingRisk,
    handleAddNewRisk,
    handleUpdateNewRisk,
    handleRemoveNewRisk,
    handleToggleAIRiskDatabase,
    
    // NEW: Edit mode handlers
    handleEditExistingRisk,
    handleUpdateExistingRisk,
    handleRemoveExistingRisk: handleRemoveExistingRiskFromUseCase,
    handleCancelEditRisk,
    handleSaveEditRisk,
    
    // Utilities
    initializeEditRisks,
    resetRisks,
    getFinalRiskData,
    getTotalRiskCount // NEW: For calculating total risks
  };
};
