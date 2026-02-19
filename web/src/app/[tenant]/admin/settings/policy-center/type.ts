export interface PolicyPack {
  id: string;
  name: string;
  description: string;
  category: string;
  country: string;
  state?: string; // Optional for future state/province support
  projectsCompliant: number;
  totalProjects: number;
  isActive: boolean;
  tags: string[];
  icon: string;
  color: string;
  type?: "Mandatory" | "Voluntary" | ""; // Added policy type
  docsRequired?: boolean;
  disable?: boolean;
}

export interface Connector {
  id: string;
  name: string;
  status: "Add Credentials" | "Revoke Connection";
  icon: string;
}
