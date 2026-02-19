"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button, Input, Radio, RadioGroup, Textarea } from "@nextui-org/react";
import { Label } from "@/components/ui/label";
export default function Feedback() {
  const [openModal, setOpenModal] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const handleFeedbackFromSubmit = () => {
    if (
      !feedBackData.title ||
      !feedBackData.category ||
      !feedBackData.Description
    )
      return;

    // Static behavior - simulate successful feedback submission
    console.log("Feedback submitted:", {
      title: feedBackData.title,
      category: feedBackData.category,
      description: feedBackData.Description,
    });

    // Reset form after "submission"
    setFeedBackData({
      title: "",
      category: "rate_your_experience",
      rating: "",
      Description: "",
      doContact: true,
    });

    // Simulate success message
    alert("Thank you for your feedback! It has been recorded.");
  };
  const [feedBackData, setFeedBackData] = useState({
    title: "",
    category: "rate_your_experience",
    rating: "",
    Description: "",
    doContact: true,
  });

  const handleFeedbackInputChange = (e: any) => {
    setFeedBackData({
      ...feedBackData,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="">
        <DialogHeader>
          {openModal === "feedback" && (
            <div className="flex w-full items-center">
              {/* <MdPersonAddAlt size={24} color="#000000" /> */}
              <h2 className="flex mx-3  font-semibold text-lg">
                Feedback Form
              </h2>
            </div>
          )}
          {openModal === "support" && (
            <div className="flex w-full items-center">
              {/* <MdPersonAddAlt size={24} color="#000000" /> */}
              <h2 className="flex mx-3  font-semibold text-lg">
                Support
              </h2>
            </div>
          )}
        </DialogHeader>
        {openModal === "feedback" && (
          <>
            <Input
              label="Title*"
              placeholder="Enter your query title"
              type="text"
              variant="bordered"
              className=""
              isRequired={false}
              value={feedBackData.title}
              name="title"
              onChange={handleFeedbackInputChange}
            />
            <div>
              <Label>Category*</Label>
              <Select
                onValueChange={(value) => {
                  setFeedBackData({ ...feedBackData, category: value });
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={feedBackData.category} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rate_your_experience">
                    {" "}
                    Rate your experience
                  </SelectItem>
                  <SelectItem value="report_a_problem">
                    Report a problem
                  </SelectItem>
                  <SelectItem value="make_a_suggestion">
                    make_a_suggestion
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {feedBackData.category === "rate_your_experience" && (
              <div>
                <Label>Rating*</Label>
                <Select
                  onValueChange={(value) => {
                    setFeedBackData({ ...feedBackData, rating: value });
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={feedBackData.rating} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Textarea
              autoFocus
              label="Description*"
              placeholder="Enter description"
              variant="bordered"
              className=""
              isRequired={false}
              value={feedBackData.Description}
              name="Description"
              onChange={handleFeedbackInputChange}
            />

            {feedBackData.category !== "rate_your_experience" && (
              <>
                <RadioGroup
                  label="May we contact you about your feedback? *"
                  orientation="horizontal"
                  color="primary"
                >
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                </RadioGroup>
                <div>
                  <p className="text-md font-medium mb-2 text-muted-foreground">
                    Attachment
                  </p>
                  <Input
                    type="file"
                    variant="bordered"
                    className=""
                    isRequired={false}
                  />
                </div>
              </>
            )}
          </>
        )}
        {openModal === "support" && (
          <p className="text-sm  w-full">
            If you need assistance, please react out to us at
            <span className=" font-semibold"> feedback@kentron.ai</span>
          </p>
        )}
        <DialogFooter>
          {openModal === "feedback" && (
            <>
              <Button
                color="danger"
                variant="light"
                onPress={() => setOpenModal("")}
              >
                Close
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  if (openModal === "feedback") {
                    handleFeedbackFromSubmit();
                    setOpenModal("");
                  } else {
                    setOpenModal("");
                  }
                }}
              >
                Save
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
