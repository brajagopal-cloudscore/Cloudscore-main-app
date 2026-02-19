// 'use client';
// import SideBar from '@/components/admin/sidebar/Sidebar';
// import React, { ChangeEvent, useState, useEffect } from 'react';
// import Navbar from '@/components/layout/navbar/Navbar';
// import { GetConnectorsList, UpdateConnectorStatus } from '@/lib/api/connectors';
// import { Connector } from '@/types';
// import { successToast, errorToast } from '@/lib/utils/toast';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { AddCredentials, DeleteCredentials } from '@/lib/api/credManagement';
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { useSearchStore } from '@/components/search/data-factory/store';
// import { getStaticFileUrl } from '@/lib/utils/helpers';
// import Image from 'next/image';
// import { checkUserPermissions } from '@/lib/utils/roleBasedPermissions';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Button } from '@/components/ui/button';
// import { Switch } from '@/components/ui/switch';
// import { AlertCircle } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { connectorGroups } from '@/lib/utils/constants';
// import { useDebounce } from '@/hooks/useDebounce';

// interface JsonContent {
//   [key: string]: any;
// }

// const ManagedSources = () => {
//   const queryClient = useQueryClient();
//   const [selectedComponent, setSelectedComponent] =
//     useState<string>('enterprise');
//   const [selectedSource, setSelectedSource] = useState<Connector | null>(null);
//   const [credValue, setCreadValue] = useState('');
//   const [config, setConfig] = useState<any>({});
//   const [accountId, setAccountId] = useState('');
//   const [showError, setShowError] = useState(false);
//   const [file, setFile] = useState<string>('');
//   const [userEmail, setUserEmail] = useState('');
//   const [apiToken, setApiToken] = useState('');
//   const [clientId, setClientId] = useState('');
//   const [clientSecret, setClientSecret] = useState('');
//   const [hostUrl, setHostUrl] = useState('');
//   const [subdomain, setSubdomain] = useState('');
//   const [slackUserToken, setSlackUserToken] = useState('');
//   const [slackBotToken, setSlackBotToken] = useState('');
//   const [tenantId, setTenantId] = useState('');
//   const [open, setOpen] = useState(false);
//   const [isFormValid, setIsFormValid] = useState(false);
//   const [search, setSearch] = useState('');
//   const debouncedSearch = useDebounce(search, 1000);

//   const { userData: userProfile } = useSearchStore();

//   const { data: allConnectors, refetch, isLoading } = useQuery({
//     queryKey: ['allConnectors', userProfile?.tenant, debouncedSearch],
//     queryFn: () => GetConnectorsList(debouncedSearch),
//   });

//   const { mutate: addCredentials } = useMutation({
//     mutationFn: AddCredentials,
//     onSuccess: (response: any) => {
//       if (response?.data?.message) successToast(response, 'Tenant connector source', 'added ');
//       else if (response?.message) successToast(response, 'Tenant connector source', 'added ');
//       else successToast(response, 'Tenant connector source', 'added ');
//       refetch();
//       setCreadValue('');
//       setUserEmail('');
//       setApiToken('');
//       setClientId('');
//       setClientSecret('');
//       setHostUrl('');
//       setSubdomain('');
//       setTenantId('');
//     },
//     onError: (error: any) => {
//       if (error?.response?.data?.detail) errorToast(error);
//       else if (error?.response?.data?.message) errorToast(error);
//       else if (error?.message) errorToast(error);
//       else errorToast('Failed to add tenant connector source');
//     },
//   });

//   const { mutate: updateConnectorStatus } = useMutation({
//     mutationFn: UpdateConnectorStatus,
//     onSuccess: (response: any) => {
//       if (response?.data?.message) successToast(response, 'Tenant connector source', 'updated ');
//       else if (response?.message) successToast(response, 'Tenant connector source', 'updated ');
//       else successToast(response, 'Tenant connector source', 'updated ');
//       refetch();
//     },
//     onError: (error: any) => {
//       if (error?.response?.data?.detail) errorToast(error);
//       else if (error?.response?.data?.message) errorToast(error);
//       else if (error?.message) errorToast(error);
//       else errorToast('Failed to update tenant connector source');
//     },
//   });

//   const { mutate: deleteCredentials } = useMutation({
//     mutationFn: DeleteCredentials,
//     onSuccess: (response: any) => {
//       if (response?.data?.message) successToast(response, 'Tenant connector source', 'deleted ');
//       else if (response?.message) successToast(response, 'Tenant connector source', 'deleted ');
//       else successToast(response, 'Tenant connector source', 'deleted ');
//       refetch();
//     },
//     onError: (error: any) => {
//       if (error?.response?.data?.detail) errorToast(error);
//       else if (error?.response?.data?.message) errorToast(error);
//       else if (error?.message) errorToast(error);
//       else errorToast('Failed to delete tenant connector source');
//     },
//   });

//   useEffect(() => {
//     queryClient.invalidateQueries({ queryKey: ['allConnectors'] });
//   }, []);

//   const isValidEmail = (email: string): boolean => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const isValidUrl = (url: string): boolean => {
//     const urlRegex =
//       /^((http|https):\/\/)(www\.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)$/;
//     return urlRegex.test(url);
//   };

//   // Helper function to validate GUID format for tenant ID
//   const isValidGuid = (guid: string): boolean => {
//     const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
//     return guidRegex.test(guid);
//   };

//   const handleUpdateConnectorStatus = async (connector: Connector) => {
//     const data = {
//       id: connector.id,
//       is_active: !connector.is_active,
//     };
//     updateConnectorStatus(data);
//   };

//   const validateBoxJSON = (jsonString: string): { isValid: boolean; error?: string } => {
//     try {
//       const parsed = JSON.parse(jsonString);

//       // Check if it has the required structure
//       if (!parsed.boxAppSettings) {
//         return { isValid: false, error: "Missing 'boxAppSettings' field" };
//       }

//       if (!parsed.enterpriseID) {
//         return { isValid: false, error: "Missing 'enterpriseID' field" };
//       }

//       const { boxAppSettings } = parsed;

//       if (!boxAppSettings.clientID) {
//         return { isValid: false, error: "Missing 'boxAppSettings.clientID' field" };
//       }

//       if (!boxAppSettings.clientSecret) {
//         return { isValid: false, error: "Missing 'boxAppSettings.clientSecret' field" };
//       }

//       if (!boxAppSettings.appAuth) {
//         return { isValid: false, error: "Missing 'boxAppSettings.appAuth' field" };
//       }

//       const { appAuth } = boxAppSettings;

//       if (!appAuth.publicKeyID) {
//         return { isValid: false, error: "Missing 'boxAppSettings.appAuth.publicKeyID' field" };
//       }

//       if (!appAuth.privateKey) {
//         return { isValid: false, error: "Missing 'boxAppSettings.appAuth.privateKey' field" };
//       }

//       if (!appAuth.passphrase) {
//         return { isValid: false, error: "Missing 'boxAppSettings.appAuth.passphrase' field" };
//       }

//       return { isValid: true };
//     } catch (error) {
//       return { isValid: false, error: "Invalid JSON format" };
//     }
//   };

//   const validateForm = () => {
//     if (!selectedSource) {
//       setIsFormValid(false);
//       return;
//     }

//     const sourceName = selectedSource.master_connector_source.connectorsource_name;
//     let isValid = false;

//     switch (sourceName) {
//       case connectorGroups.google:
//         isValid =
//           Boolean(file) &&
//           userEmail !== '' &&
//           isValidEmail(userEmail) &&
//           Object.keys(config).length > 0;
//         break;

//       case connectorGroups.jira:
//       case connectorGroups.confluence:
//         isValid =
//           hostUrl !== '' &&
//           isValidUrl(hostUrl) &&
//           userEmail !== '' &&
//           isValidEmail(userEmail) &&
//           apiToken !== '';
//         break;

//       case connectorGroups.slack:
//         isValid = slackUserToken !== '' && slackBotToken !== '';
//         break;

//       case connectorGroups.zendesk:
//         isValid = subdomain !== '' && apiToken !== '';
//         break;

//       case connectorGroups.teams:
//         isValid = hostUrl !== '' && clientId !== '' && clientSecret !== '';
//         break;

//       case connectorGroups.zoom:
//         isValid = accountId !== '' && clientId !== '' && clientSecret !== '';
//         break;

//       case 'Outlook':
//       case 'Microsoft Outlook':
//         isValid = clientId !== '' && clientSecret !== '' && tenantId !== '';
//         break;

//       case 'Box':
//         const boxValidation = validateBoxJSON(credValue);
//         isValid = boxValidation.isValid;
//         break;

//       default:
//         isValid = credValue.trim() !== '';
//         break;
//     }

//     setIsFormValid(isValid);
//   };

//   useEffect(() => {
//     validateForm();
//   }, [
//     selectedSource,
//     file,
//     config,
//     userEmail,
//     hostUrl,
//     apiToken,
//     slackUserToken,
//     slackBotToken,
//     subdomain,
//     clientId,
//     clientSecret,
//     accountId,
//     tenantId,
//     credValue,
//   ]);

//   const handleSave = async () => {
//     if (!selectedSource || !isFormValid) {
//       setShowError(true);
//       return;
//     }

//     let data = null;
//     if (
//       selectedSource.master_connector_source.connectorsource_name ===
//       connectorGroups.google
//     ) {
//       if (!file || userEmail === '' || !isValidEmail(userEmail)) {
//         setShowError(true);
//         return;
//       }
//       try {
//         const googleConfig = {
//           service_json: config,
//           admin_email: userEmail,
//         };

//         data = JSON.stringify({
//           tenant: userProfile?.tenant,
//           connector_source: selectedSource.id,
//           user: userProfile?.id,
//           secret_config: JSON.stringify(googleConfig),
//         });
//       } catch (error) {
//         errorToast('Invalid JSON configuration');
//         return;
//       }
//     } else if (
//       selectedSource.master_connector_source.connectorsource_name === connectorGroups.jira ||
//       selectedSource.master_connector_source.connectorsource_name === connectorGroups.confluence
//     ) {
//       if (hostUrl === '' || !isValidUrl(hostUrl) || userEmail === '' || !isValidEmail(userEmail) || apiToken === '') {
//         setShowError(true);
//         return;
//       }

//       data = JSON.stringify({
//         secret_config: JSON.stringify({
//           hostUrl,
//           userEmail,
//           apiToken,
//         }),
//         tenant: userProfile?.tenant,
//         connector_source: selectedSource.id,
//         user: userProfile?.id,
//       });
//     } else if (
//       selectedSource.master_connector_source.connectorsource_name ===
//       connectorGroups.slack
//     ) {
//       if (slackUserToken === '' || slackBotToken === '') {
//         setShowError(true);
//         return;
//       }

//       data = JSON.stringify({
//         secret_config: JSON.stringify({
//           slackUserToken,
//           slackBotToken,
//         }),
//         tenant: userProfile?.tenant,
//         connector_source: selectedSource.id,
//         user: userProfile?.id,
//       });
//     } else if (
//       selectedSource.master_connector_source.connectorsource_name ===
//       connectorGroups.zendesk
//     ) {
//       if (subdomain === '' || apiToken === '') {
//         setShowError(true);
//         return;
//       }

//       data = JSON.stringify({
//         secret_config: JSON.stringify({
//           subdomain,
//           apiToken,
//         }),
//         tenant: userProfile?.tenant,
//         connector_source: selectedSource.id,
//         user: userProfile?.id,
//       });
//     } else if (
//       selectedSource.master_connector_source.connectorsource_name ===
//       connectorGroups.teams
//     ) {
//       if (hostUrl === '' || !isValidUrl(hostUrl) || clientId === '' || clientSecret === '') {
//         setShowError(true);
//         return;
//       }

//       data = JSON.stringify({
//         secret_config: JSON.stringify({
//           hostUrl,
//           clientId,
//           clientSecret,
//         }),
//         tenant: userProfile?.tenant,
//         connector_source: selectedSource.id,
//         user: userProfile?.id,
//       });
//     } else if (
//       selectedSource.master_connector_source.connectorsource_name ===
//       connectorGroups.zoom
//     ) {
//       if (accountId === '' || clientId === '' || clientSecret === '') {
//         setShowError(true);
//         return;
//       }

//       data = JSON.stringify({
//         secret_config: JSON.stringify({
//           accountId,
//           clientId,
//           clientSecret,
//         }),
//         tenant: userProfile?.tenant,
//         connector_source: selectedSource.id,
//         user: userProfile?.id,
//       });
//     } else if (
//       selectedSource.master_connector_source.connectorsource_name === connectorGroups.microsoft_outlook
//     ) {
//       if (clientId === '' || clientSecret === '' || tenantId === '' || !isValidGuid(tenantId)) {
//         setShowError(true);
//         return;
//       }

//       data = JSON.stringify({
//         secret_config: JSON.stringify({
//           client_id: clientId,
//           client_secret: clientSecret,
//           tenant_id: tenantId,
//         }),
//         tenant: userProfile?.tenant,
//         connector_source: selectedSource.id,
//         user: userProfile?.id,
//       });
//     } else if (selectedSource.master_connector_source.connectorsource_name === connectorGroups.box) {
//       const boxValidation = validateBoxJSON(credValue);
//       if (!boxValidation.isValid) {
//         setShowError(true);
//         errorToast(boxValidation.error || 'Invalid Box configuration');
//         return;
//       }

//       try {
//         JSON.parse(credValue);

//         data = JSON.stringify({
//           secret_config: credValue,
//           tenant: userProfile?.tenant,
//           connector_source: selectedSource.id,
//           user: userProfile?.id,
//         });
//       } catch (error) {
//         errorToast('Invalid JSON format');
//         return;
//       }
//     } else {
//       try {
//         // Check if credValue is valid JSON
//         JSON.parse(credValue);

//         data = JSON.stringify({
//           secret_config: credValue,
//           tenant: userProfile?.tenant,
//           connector_source: selectedSource.id,
//           user: userProfile?.id,
//         });
//       } catch (error) {
//         errorToast('Invalid JSON format');
//         return;
//       }
//     }

//     setShowError(false);
//     setOpen(false);

//     addCredentials(data);
//   };

//   const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = event.target.files?.[0];
//     if (selectedFile) {
//       setFile(selectedFile.name); // Store the file name
//       const reader = new FileReader();
//       reader.onload = (e: ProgressEvent<FileReader>) => {
//         try {
//           const content = e.target?.result;
//           if (typeof content === 'string') {
//             const json = JSON.parse(content) as JsonContent;
//             setConfig(json);
//           }
//         } catch (error) {
//           console.error('Error parsing JSON:', error);
//           setConfig({});
//         }
//       };
//       reader.readAsText(selectedFile);
//     } else {
//       setFile('');
//       setConfig({});
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!userProfile) return;
//     deleteCredentials({ tenant_id: userProfile?.tenant || '', source_id: id });
//   };

//   const renderCredentialComponent = (connector_source: string) => {
//     switch (connector_source) {
//       case connectorGroups.google:
//         return (
//           <>
//             <div className="space-y-2">
//               <label htmlFor="file" className="text-sm font-medium text-[#18181B]">
//                 Service Account JSON*
//               </label>
//               <Input
//                 id="file"
//                 type="file"
//                 accept=".json"
//                 onChange={handleFileChange}
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && !file) && "border-red-500"
//                 )}
//               />
//               {showError && !file && (
//                 <p className="text-xs text-red-500">Please upload a JSON file</p>
//               )}
//               {file && (
//                 <p className="text-xs text-green-600">File selected: {file}</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="adminEmail" className="text-sm font-medium text-[#18181B]">
//                 Admin Email*
//               </label>
//               <Input
//                 id="adminEmail"
//                 placeholder="Enter admin email"
//                 value={userEmail}
//                 onChange={(e) => setUserEmail(e.target.value)}
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && (userEmail === '' || !isValidEmail(userEmail))) && "border-red-500"
//                 )}
//               />
//               {showError && userEmail === '' && (
//                 <p className="text-xs text-red-500">Admin email is required</p>
//               )}
//               {showError && userEmail !== '' && !isValidEmail(userEmail) && (
//                 <p className="text-xs text-red-500">Please enter a valid email</p>
//               )}
//             </div>
//           </>
//         );
//       case connectorGroups.jira:
//       case connectorGroups.confluence:
//         return (
//           <>
//             <div className="space-y-2">
//               <label htmlFor="hostUrl" className="text-sm font-medium text-[#18181B]">
//                 Host URL*
//               </label>
//               <Input
//                 id="hostUrl"
//                 placeholder="Enter your host URL (e.g., https://your-domain.atlassian.net)"
//                 value={hostUrl}
//                 onChange={(e) => setHostUrl(e.target.value)}
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && (hostUrl === '' || !isValidUrl(hostUrl))) && "border-red-500"
//                 )}
//               />
//               {showError && hostUrl === '' && (
//                 <p className="text-xs text-red-500">Host URL is required</p>
//               )}
//               {showError && hostUrl !== '' && !isValidUrl(hostUrl) && (
//                 <p className="text-xs text-red-500">Please enter a valid URL</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="email" className="text-sm font-medium text-[#18181B]">
//                 Email*
//               </label>
//               <Input
//                 id="email"
//                 placeholder="Enter your email"
//                 value={userEmail}
//                 onChange={(e) => setUserEmail(e.target.value)}
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && (userEmail === '' || !isValidEmail(userEmail))) && "border-red-500"
//                 )}
//               />
//               {showError && userEmail === '' && (
//                 <p className="text-xs text-red-500">Email is required</p>
//               )}
//               {showError && userEmail !== '' && !isValidEmail(userEmail) && (
//                 <p className="text-xs text-red-500">Please enter a valid email</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="apiToken" className="text-sm font-medium text-[#18181B]">
//                 API Token*
//               </label>
//               <Input
//                 id="apiToken"
//                 placeholder="Enter your API token"
//                 value={apiToken}
//                 onChange={(e) => setApiToken(e.target.value)}
//                 type="password"
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && apiToken === '') && "border-red-500"
//                 )}
//               />
//               {showError && apiToken === '' && (
//                 <p className="text-xs text-red-500">API token is required</p>
//               )}
//             </div>
//           </>
//         );
//       case connectorGroups.slack:
//         return (
//           <>
//             <div className="space-y-2">
//               <label htmlFor="slackUserToken" className="text-sm font-medium text-[#18181B]">
//                 User Token*
//               </label>
//               <Input
//                 id="slackUserToken"
//                 placeholder="Enter your Slack user token (xoxp-...)"
//                 value={slackUserToken}
//                 onChange={(e) => setSlackUserToken(e.target.value)}
//                 type="password"
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && slackUserToken === '') && "border-red-500"
//                 )}
//               />
//               {showError && slackUserToken === '' && (
//                 <p className="text-xs text-red-500">User token is required</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="slackBotToken" className="text-sm font-medium text-[#18181B]">
//                 Bot Token*
//               </label>
//               <Input
//                 id="slackBotToken"
//                 placeholder="Enter your Slack bot token (xoxb-...)"
//                 value={slackBotToken}
//                 onChange={(e) => setSlackBotToken(e.target.value)}
//                 type="password"
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && slackBotToken === '') && "border-red-500"
//                 )}
//               />
//               {showError && slackBotToken === '' && (
//                 <p className="text-xs text-red-500">Bot token is required</p>
//               )}
//             </div>
//           </>
//         );
//       case connectorGroups.zendesk:
//         return (
//           <>
//             <div className="space-y-2">
//               <label htmlFor="subdomain" className="text-sm font-medium text-[#18181B]">
//                 Subdomain*
//               </label>
//               <Input
//                 id="subdomain"
//                 placeholder="Enter your Zendesk subdomain (e.g., company)"
//                 value={subdomain}
//                 onChange={(e) => setSubdomain(e.target.value)}
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && subdomain === '') && "border-red-500"
//                 )}
//               />
//               {showError && subdomain === '' && (
//                 <p className="text-xs text-red-500">Subdomain is required</p>
//               )}
//             </div>
//             <div className="space-y-2">
//               <label htmlFor="apiToken" className="text-sm font-medium text-[#18181B]">
//                 API Token*
//               </label>
//               <Input
//                 id="apiToken"
//                 placeholder="Enter your Zendesk API token"
//                 value={apiToken}
//                 onChange={(e) => setApiToken(e.target.value)}
//                 type="password"
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && apiToken === '') && "border-red-500"
//                 )}
//               />
//               {showError && apiToken === '' && (
//                 <p className="text-xs text-red-500">API token is required</p>
//               )}
//             </div>
//           </>
//         );
//       case connectorGroups.teams:
//         return (
//           <>
//             <div className="space-y-2">
//               <label htmlFor="hostUrl" className="text-sm font-medium text-[#18181B]">
//                 Host URL*
//               </label>
//               <Input
//                 id="hostUrl"
//                 placeholder="Enter your Microsoft Teams host URL"
//                 value={hostUrl}
//                 onChange={(e) => setHostUrl(e.target.value)}
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && (hostUrl === '' || !isValidUrl(hostUrl))) && "border-red-500"
//                 )}
//               />
//               {showError && hostUrl === '' && (
//                 <p className="text-xs text-red-500">Host URL is required</p>
//               )}
//               {showError && hostUrl !== '' && !isValidUrl(hostUrl) && (
//                 <p className="text-xs text-red-500">Please enter a valid URL</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="clientId" className="text-sm font-medium text-[#18181B]">
//                 Client ID*
//               </label>
//               <Input
//                 id="clientId"
//                 placeholder="Enter your Client ID"
//                 value={clientId}
//                 onChange={(e) => setClientId(e.target.value)}
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && clientId === '') && "border-red-500"
//                 )}
//               />
//               {showError && clientId === '' && (
//                 <p className="text-xs text-red-500">Client ID is required</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="clientSecret" className="text-sm font-medium text-[#18181B]">
//                 Client Secret*
//               </label>
//               <Input
//                 id="clientSecret"
//                 placeholder="Enter your Client Secret"
//                 value={clientSecret}
//                 onChange={(e) => setClientSecret(e.target.value)}
//                 type="password"
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && clientSecret === '') && "border-red-500"
//                 )}
//               />
//               {showError && clientSecret === '' && (
//                 <p className="text-xs text-red-500">Client Secret is required</p>
//               )}
//             </div>
//           </>
//         );
//       case connectorGroups.zoom:
//         return (
//           <>
//             <div className="space-y-2">
//               <label htmlFor="accountId" className="text-sm font-medium text-[#18181B]">
//                 Account ID*
//               </label>
//               <Input
//                 id="accountId"
//                 placeholder="Enter your Zoom Account ID"
//                 value={accountId}
//                 onChange={(e) => setAccountId(e.target.value)}
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && accountId === '') && "border-red-500"
//                 )}
//               />
//               {showError && accountId === '' && (
//                 <p className="text-xs text-red-500">Account ID is required</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="clientId" className="text-sm font-medium text-[#18181B]">
//                 Client ID*
//               </label>
//               <Input
//                 id="clientId"
//                 placeholder="Enter your Client ID"
//                 value={clientId}
//                 onChange={(e) => setClientId(e.target.value)}
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && clientId === '') && "border-red-500"
//                 )}
//               />
//               {showError && clientId === '' && (
//                 <p className="text-xs text-red-500">Client ID is required</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="clientSecret" className="text-sm font-medium text-[#18181B]">
//                 Client Secret*
//               </label>
//               <Input
//                 id="clientSecret"
//                 placeholder="Enter your Client Secret"
//                 value={clientSecret}
//                 onChange={(e) => setClientSecret(e.target.value)}
//                 type="password"
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && clientSecret === '') && "border-red-500"
//                 )}
//               />
//               {showError && clientSecret === '' && (
//                 <p className="text-xs text-red-500">Client Secret is required</p>
//               )}
//             </div>
//           </>
//         );

//       case 'Microsoft Outlook':
//         return (
//           <>
//             <div className="space-y-2">
//               <label htmlFor="clientId" className="text-sm font-medium text-[#18181B]">
//                 Client ID*
//               </label>
//               <Input
//                 id="clientId"
//                 placeholder="Enter your Microsoft Application Client ID"
//                 value={clientId}
//                 onChange={(e) => setClientId(e.target.value)}
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && clientId === '') && "border-red-500"
//                 )}
//               />
//               {showError && clientId === '' && (
//                 <p className="text-xs text-red-500">Client ID is required</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="clientSecret" className="text-sm font-medium text-[#18181B]">
//                 Client Secret*
//               </label>
//               <Input
//                 id="clientSecret"
//                 placeholder="Enter your Microsoft Application Client Secret"
//                 value={clientSecret}
//                 onChange={(e) => setClientSecret(e.target.value)}
//                 type="password"
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && clientSecret === '') && "border-red-500"
//                 )}
//               />
//               {showError && clientSecret === '' && (
//                 <p className="text-xs text-red-500">Client Secret is required</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="tenantId" className="text-sm font-medium text-[#18181B]">
//                 Tenant ID*
//               </label>
//               <Input
//                 id="tenantId"
//                 placeholder="Enter your Microsoft Tenant ID"
//                 value={tenantId}
//                 onChange={(e) => setTenantId(e.target.value)}
//                 className={cn(
//                   "text-sm border-[#E4E4E7] text-[#18181B]",
//                   (showError && tenantId === '') && "border-red-500"
//                 )}
//               />
//               {showError && tenantId === '' && (
//                 <p className="text-xs text-red-500">Tenant ID is required</p>
//               )}
//             </div>
//           </>
//         );

//       case 'Box':
//         const boxValidation = validateBoxJSON(credValue);

//         return (
//           <div className="space-y-2">
//             <label htmlFor="credentials" className="text-sm font-medium text-[#18181B]">
//               Credentials JSON*
//             </label>
//             <Textarea
//               id="credentials"
//               placeholder={`Enter your Box credentials JSON here:
//   {
//     "boxAppSettings": {
//       "clientID": "your_client_id",
//       "clientSecret": "your_client_secret",
//       "appAuth": {
//         "publicKeyID": "your_public_key_id",
//         "privateKey": "your_private_key",
//         "passphrase": "your_passphrase"
//       }
//     },
//     "enterpriseID": "your_enterprise_id"
//   }`}
//               value={credValue}
//               onChange={(e) => setCreadValue(e.target.value)}
//               className={cn(
//                 "text-sm border-[#E4E4E7] text-[#18181B] min-h-[200px] font-mono",
//                 (showError && (!boxValidation.isValid || credValue === '')) && "border-red-500"
//               )}
//             />
//             {showError && credValue === '' && (
//               <p className="text-xs text-red-500">Credentials JSON is required</p>
//             )}
//             {showError && credValue !== '' && !boxValidation.isValid && (
//               <p className="text-xs text-red-500">{boxValidation.error}</p>
//             )}
//           </div>
//         );
//       default:
//         return (
//           <div className="space-y-2">
//             <label htmlFor="credentials" className="text-sm font-medium text-[#18181B]">
//               Credentials JSON*
//             </label>
//             <Textarea
//               id="credentials"
//               placeholder="Enter your credentials JSON here"
//               defaultValue={`{"value": "your_token_here"}`}
//               onChange={(e) => setCreadValue(e.target.value)}
//               className={cn(
//                 "text-sm border-[#E4E4E7] text-[#18181B] min-h-[100px]",
//                 (showError && credValue === '') && "border-red-500"
//               )}
//             />
//             {showError && credValue === '' && (
//               <p className="text-xs text-red-500">Credentials JSON is required</p>
//             )}
//           </div>
//         );
//     }
//   };

//   const resetState = () => {
//     setSelectedSource(null);
//     setCreadValue(`{"value": "your_token_here"}`);
//     setConfig({});
//     setAccountId('');
//     setUserEmail('');
//     setApiToken('');
//     setClientId('');
//     setClientSecret('');
//     setHostUrl('');
//     setSubdomain('');
//     setSlackUserToken('');
//     setSlackBotToken('');
//     setTenantId('');
//     setShowError(false);
//     setIsFormValid(false);
//   };


//   return (
//     <div className="flex text-black bg-white flex-col h-screen overflow-y-scroll justify-between w-full relative">
//       <div className="flex h-[60px] relative z-10">
//         <Navbar />
//       </div>
//       <div className="flex w-full flex-1 relative z-0">
//         <div className="fixed left-0 top-[60px] h-full">
//           <SideBar />
//         </div>

//         <div className="flex flex-col z-30 overflow-auto p-5 w-full mb-[30px] ml-[256px] pl-[15px] ">

//           <div className="w-full">
//             <div className="border-b border-[#FFFFFF]">
//               <div className="flex">
//                 <button
//                   onClick={() => setSelectedComponent('enterprise')}
//                   className={`px-4 py-2 font-sans leading-4 text-sm font-semibold ${selectedComponent === 'enterprise' ? 'border-b border-black text-[#18181B]' : 'text-[#71717A]'}`}
//                 >
//                   Enterprise sources
//                 </button>
//                 <button
//                   onClick={() => setSelectedComponent('connector')}
//                   className={`px-4 py-2 font-sans leading-4 text-sm font-semibold ${selectedComponent === 'connector' ? 'border-b border-black text-[#18181B]' : 'text-[#71717A]'}`}
//                 >
//                   Connectors
//                 </button>
//               </div>
//             </div>

//             <div className="mt-4">
//               <div className="flex items-center gap-2 p-3 bg-[#F9F9F9F9] border border-[#E4E4E7] rounded-lg ">
//                 <AlertCircle size={16} className="text-[#18181B]" />
//                 <span className="text-sm font-medium font-sans leading-[100%] text-[#18181B]">You need to add credentials to the source before you can enable it.</span>
//               </div>
//             </div>

//             {isLoading &&
//               <div className="flex h-full w-full items-center justify-center gap-2">
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
//                 <span>Loading data sources...</span>
//               </div>}

//             <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {allConnectors &&
//                 allConnectors
//                   .filter((item: Connector) => {
//                     if (selectedComponent === 'enterprise') {
//                       return item.master_connector_source.is_enterprise;
//                     } else {
//                       return !item.master_connector_source.is_enterprise;
//                     }
//                   })
//                   .sort((a: Connector, b: Connector) =>
//                     a.master_connector_source.connectorsource_name <
//                       b.master_connector_source.connectorsource_name
//                       ? -1
//                       : 1
//                   )
//                   .map((item: Connector, index: number) => (
//                     <div key={index} className='flex flex-col  border-[#E4E4E7] border rounded-md p-4'>
//                       <div
//                         className=" flex flex-row items-center "
//                       >
//                         <div className="flex items-start gap-2 w-full">
//                           <div className="flex items-center justify-center w-[24px] h-[24px]">
//                             <Image
//                               src={getStaticFileUrl(item?.master_connector_source?.logo)}
//                               width={24}
//                               height={24}
//                               alt={item.master_connector_source.connectorsource_name}
//                               className="object-contain"
//                             />
//                           </div>
//                           <div className="flex flex-col w-full">
//                             <span className="text-[#09090B] font-semibold text-[13px] leading-none font-sans">
//                               {item.master_connector_source.connectorsource_name}
//                             </span>
//                             {item.master_connector_source.is_enterprise && (
//                               <div className="pb-2 pt-0">
//                                 {!item.is_credentials_added ? (
//                                   <span
//                                     onClick={() => {
//                                       if (checkUserPermissions(userProfile)) {
//                                         setSelectedSource(item);
//                                         setOpen(true);
//                                       }
//                                     }}
//                                     className={`text-[12px] font-normal font-sans leading-5  border-b ${checkUserPermissions(userProfile) ? ' border-[#1C9852] text-[#1C9852] cursor-pointer' : 'text-[#A1A1AA] cursor-not-allowed'}`}
//                                   >
//                                     Add Credentials
//                                   </span>
//                                 ) : (
//                                   <span
//                                     onClick={() => {
//                                       if (checkUserPermissions(userProfile)) {
//                                         handleDelete(item.id);
//                                       }
//                                     }}
//                                     className={`text-[12px] font-normal font-sans leading-5  border-b border-[#D84040]   text-[#D84040] cursor-pointer`}
//                                   >
//                                     Revoke Connection
//                                   </span>
//                                 )}

//                               </div>

//                             )}
//                             <div className="flex flex-row items-center justify-between  ">
//                               <span className={item.master_connector_source.is_enterprise ? " mt-0 font-normal text-[12px] leading-5  text-[#777777]" : "pt-[12px]  font-normal text-[12px] leading-5  text-[#777777]"} >Manage Source</span>
//                               <Switch
//                                 checked={item.is_active}
//                                 onCheckedChange={() => handleUpdateConnectorStatus(item)}
//                                 disabled={
//                                   !checkUserPermissions(userProfile) ||
//                                   (item.master_connector_source.is_enterprise
//                                     ? !item.is_credentials_added
//                                     : false)
//                                 }
//                                 className=" w-[36px] h-[20px] data-[state=checked]:bg-black data-[state=checked]:border-black"
//                               />
//                             </div>
//                           </div>

//                         </div>
//                       </div>

//                     </div>
//                   ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       <Dialog open={open} onOpenChange={(isOpen) => {
//         if (!isOpen) {
//           resetState();
//         }
//         setOpen(isOpen);
//       }}>
//         <DialogContent className="sm:max-w-[425px] bg-white">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-base font-semibold text-[#18181B]">
//               {selectedSource && (
//                 <Image
//                   src={getStaticFileUrl(selectedSource?.master_connector_source?.logo)}
//                   width={20}
//                   height={20}
//                   alt={selectedSource?.master_connector_source?.connectorsource_name || ''}
//                   className=" w-[20px] h-[20px] object-contain"
//                 />
//               )}
//               Add Credentials
//             </DialogTitle>
//           </DialogHeader>

//           <div className="space-y-4 py-2">
//             {renderCredentialComponent(
//               selectedSource?.master_connector_source?.connectorsource_name || ''
//             )}
//           </div>

//           <DialogFooter className="pt-4">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setOpen(false);
//                 resetState();
//               }}
//               className="border-[#E4E4E7] text-[#18181B] hover:bg-[#F4F4F5] hover:text-[#18181B]"
//             >
//               Close
//             </Button>
//             <Button
//               onClick={handleSave}
//               disabled={!isFormValid}
//               className="bg-black text-white hover:bg-black/90"
//             >
//               Save
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default ManagedSources;
