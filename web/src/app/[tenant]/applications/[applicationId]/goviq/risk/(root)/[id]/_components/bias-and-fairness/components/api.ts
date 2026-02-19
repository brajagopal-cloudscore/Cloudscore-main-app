import { BiasCheck } from "../page";

export const GetAllFairnessChecks = async ({
  page,
  page_size,
  search,
}: { page: number; page_size: number; search: string }) => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const mockData: BiasCheck[] = [
    {
      _id: "1",
      sCheckId: "FC001",
      sModel: "Credit Scoring Model v2.1",
      sDescription: "Comprehensive bias assessment for credit scoring algorithm",
      sStatus: "Completed",
      dCreatedAt: "2024-01-15T10:30:00Z",
    },
    {
      _id: "2",
      sCheckId: "FC002",
      sModel: "Hiring Algorithm v1.5",
      sDescription: "Fairness evaluation for recruitment AI system",
      sStatus: "In Progress",
      dCreatedAt: "2024-01-14T14:20:00Z",
    },
    {
      _id: "3",
      sCheckId: "FC003",
      sModel: "Loan Approval System",
      sDescription: "Bias detection and mitigation for loan processing",
      sStatus: "Pending",
      dCreatedAt: "2024-01-13T09:15:00Z",
    },
  ]

  const filteredData = search
    ? mockData.filter(
        (item) =>
          item.sCheckId.toLowerCase().includes(search.toLowerCase()) ||
          item.sModel.toLowerCase().includes(search.toLowerCase()),
      )
    : mockData

  const startIndex = (page - 1) * page_size
  const endIndex = startIndex + page_size
  const paginatedData = filteredData.slice(startIndex, endIndex)

  return {
    result: {
      aData: paginatedData,
      nCount: paginatedData.length,
      nTotal: filteredData.length,
    },
  }
}

export const DeleteFairnessCheck = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 800))
  console.log("Deleting fairness check:", id)
  return { message: "Fairness check deleted successfully" }
}
