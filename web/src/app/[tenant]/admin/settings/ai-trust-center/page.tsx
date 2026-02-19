"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileText } from "lucide-react";
// Removed Navbar import - using static layout instead
import SideBar from "@/components/admin/sidebar/Sidebar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const AIComplianceDashboard = () => {
  const [previewMode, setPreviewMode] = useState(false);

  const handleDownloadReport = () => {
    const link = document.createElement("a");
    link.href = "/aireport.docx"; // Path to the file in public folder
    link.download = "Report.docx"; // Name of the downloaded file
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compliance badges
  const complianceBadges = [
    "SOC2 Type I",
    "SOC2 Type II",
    "ISO 27001",
    "ISO 42001",
    "CCPA",
    "GDPR",
    "HIPAA",
    "EU AI Act",
  ];

  return (
    <div className="flex flex-col p-5">
      {/* Content */}
      <div className="w-full">
        {/* Header with Preview Mode Toggle */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-black">AI trust center</h1>
            </div>
            <p className="text-gray-600 mt-1">
              AI Trust Center centralizes your AI policies, certifications, and
              subprocessors to demonstrate responsible, transparent, and
              compliant AI practices.
            </p>
          </div>
          <div>
            <Button
              variant="outline"
              className="border-black text-black hover:bg-gray-100"
              onClick={handleDownloadReport}
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate report
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <div className="flex space-x-8">
            <button className="pb-2 border-b-2 border-teal-500 text-teal-600 font-medium">
              Overview
            </button>
            <button className="pb-2 text-gray-500">Resources</button>
            <button className="pb-2 text-gray-500">Subprocessors</button>
          </div>
        </div>

        {/* Introduction Section */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Introduction</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Enabled and visible
                </span>
                <Switch
                 
                  defaultChecked
                  className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Switch
                     
                      defaultChecked
                      className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                    <h3 className="font-semibold text-black">
                      Purpose of our trust center
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Our Trust Center demonstrates our commitment to responsible
                    AI practices and data privacy. We believe in transparency,
                    ethical AI development, and building trust with our
                    customers through clear communication about our AI
                    governance practices.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Switch
                      
                      defaultChecked
                      className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                    <h3 className="font-semibold text-black">Our statement</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    We are committed to ethical AI development and transparent
                    data practices. Our AI solutions are designed with privacy,
                    security, and fairness at their core, ensuring that we build
                    trust with our customers while delivering innovative
                    technology.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Switch
                     
                      defaultChecked
                      className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                    <h3 className="font-semibold text-black">Our mission</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    To build trust through responsible AI innovation and
                    transparent governance. We strive to be the gold standard in
                    AI ethics and compliance, ensuring our technology serves
                    humanity while protecting individual rights and privacy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Compliance and Certification Badges */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-black">
                    Compliance and certification badges
                  </h2>
                  <p className="text-sm text-gray-600">
                    Compliance badges for certifications and standards (e.g., EU
                    AI Act, NIST, SOC2, ISO 27001, GDPR).
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Enabled and visible
                  </span>
                  <Switch
                    
                    defaultChecked
                    className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {complianceBadges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-500" />
                    <span className="text-sm text-black">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Description and Values */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black">
                  Company description and values
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Enabled and visible
                  </span>
                  <Switch
                   
                    defaultChecked
                    className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Switch
                       
                        defaultChecked
                        className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                      />
                      <h3 className="font-semibold text-black">Background</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      We are a leading AI company focused on ethical and
                      responsible AI development. Our team of experts combines
                      deep technical knowledge with a strong commitment to AI
                      governance, ensuring that our solutions not only deliver
                      exceptional results but also maintain the highest
                      standards of integrity and compliance.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Switch
                       
                        defaultChecked
                        className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                      />
                      <h3 className="font-semibold text-black">
                        Core benefits
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Our AI solutions provide enhanced security, efficiency,
                      and customer support while maintaining the highest ethical
                      standards. We offer comprehensive AI governance tools,
                      automated compliance monitoring, and transparent reporting
                      capabilities that help organizations build trust with
                      their stakeholders.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Switch
                       
                        defaultChecked
                        className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                      />
                      <h3 className="font-semibold text-black">
                        Compliance documentation
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Access our comprehensive compliance documentation and
                      certifications. Our compliance with detailed audit
                      reports, technical documentation, and governance
                      frameworks that demonstrate our unwavering commitment to
                      AI governance best practices.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIComplianceDashboard;
