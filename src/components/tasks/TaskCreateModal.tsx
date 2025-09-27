import { useState, useEffect } from "react";
import {
  X,
  Target,
  Calendar,
  User,
  Clock,
  FileText,
  Plus,
  List,
  Layers,
  Upload,
  Paperclip,
  Download,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { taskService } from "@/lib/taskService";
import { mockProjects } from "@/lib/projectService";
import { mockEmployees } from "@/lib/taskService";
import { Task as TaskType } from "@/types/task";

interface Task {
  id: string;
  title: string;
  projectName: string;
  assignedTo: string;
  priority: string;
  status: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  description?: string;
  parentTaskId?: string;
}

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
}

export function TaskCreateModal({
  isOpen,
  onClose,
  onTaskCreated,
}: TaskCreateModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [availableMainTasks, setAvailableMainTasks] = useState<TaskType[]>([]);
  const [filteredMainTasks, setFilteredMainTasks] = useState<TaskType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    taskType: "main",
    title: "",
    projectName: "",
    parentTaskId: "",
    staffRole: "",
    assignedTo: "",
    priority: "",
    status: "Pending",
    dueDate: "",
    estimatedHours: 0,
    actualHours: 0,
    description: "",
  });

  const projects = mockProjects;
  const employees = mockEmployees;

  // Load main tasks when component mounts
  useEffect(() => {
    if (isOpen) {
      loadMainTasks();
    }
  }, [isOpen]);

  // Filter main tasks when project changes
  useEffect(() => {
    if (formData.taskType === "sub" && formData.projectName) {
      const filtered = availableMainTasks.filter(
        (task) => task.projectName === formData.projectName
      );
      setFilteredMainTasks(filtered);
    } else {
      setFilteredMainTasks(availableMainTasks);
    }
  }, [formData.projectName, formData.taskType, availableMainTasks]);

  const loadMainTasks = async () => {
    try {
      const mainTasks = await taskService.getMainTasks();
      setAvailableMainTasks(mainTasks);
      setFilteredMainTasks(mainTasks);
    } catch (error) {
      console.error("Error loading main tasks:", error);
    }
  };

  const priorities = ["Low", "Medium", "High"];
  const statuses = ["Pending", "In Progress", "Completed", "Cancelled"];
  const staffRoles = [
    "Designer",
    "Web Developer",
    "Mobile Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI/UX Designer",
    "Graphic Designer",
    "Project Manager",
    "Quality Assurance",
    "DevOps Engineer",
    "Data Analyst",
    "Content Writer",
    "Marketing Specialist",
    "Sales Representative",
    "Customer Support",
    "Business Analyst",
    "Product Manager",
    "Technical Writer",
    "System Administrator",
    "Database Administrator",
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }
    if (!formData.projectName) {
      newErrors.projectName = "Project is required";
    }
    if (formData.taskType === "sub" && !formData.parentTaskId) {
      newErrors.parentTaskId = "Parent task is required for sub tasks";
    }
    if (!formData.staffRole) {
      newErrors.staffRole = "Staff role is required";
    }
    if (!formData.assignedTo) {
      newErrors.assignedTo = "Assigned to is required";
    }
    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    if (formData.estimatedHours <= 0) {
      newErrors.estimatedHours = "Estimated hours must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Reset parent task when task type changes
      if (field === "taskType") {
        newData.parentTaskId = "";
      }

      // Reset parent task when project changes for sub tasks
      if (field === "projectName" && prev.taskType === "sub") {
        newData.parentTaskId = "";
      }

      // Reset assigned employee when staff role changes
      if (field === "staffRole") {
        newData.assignedTo = "";
      }

      return newData;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const newTask: Task = {
        id: `TASK-${Date.now()}`,
        title: formData.title,
        projectName: formData.projectName,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        estimatedHours: formData.estimatedHours,
        actualHours: formData.actualHours,
        description: formData.description,
        parentTaskId:
          formData.taskType === "sub" ? formData.parentTaskId : undefined,
      };

      onTaskCreated(newTask);

      toast({
        title: "Task Created",
        description: "The task has been successfully created.",
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      taskType: "main",
      title: "",
      projectName: "",
      parentTaskId: "",
      staffRole: "",
      assignedTo: "",
      priority: "",
      status: "Pending",
      dueDate: "",
      estimatedHours: 0,
      actualHours: 0,
      description: "",
    });
    setErrors({});
    setUploadedFiles([]);
    onClose();
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    if (date) {
      handleInputChange("dueDate", date.toISOString().split("T")[0]);
    }
    setDueDateOpen(false);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Convert FileList to Array and add to uploaded files
      const newFiles = Array.from(files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Here you would implement the actual file upload logic
      // For now, we'll just simulate the upload
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(
          "Uploading file:",
          file.name,
          "Size:",
          file.size,
          "Type:",
          file.type
        );
        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      // In a real implementation, you would call an API to upload the files
      // and then update the task with the new attachments
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create New {formData.taskType === "sub" ? "Sub Task" : "Main Task"}
          </DialogTitle>
          <DialogDescription>
            {formData.taskType === "sub"
              ? "Create a sub task under a main task with all necessary details"
              : "Assign a new main task to a team member with all necessary details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Type Selection */}
          <div className="space-y-4">
            {/* <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Task Type
            </h3> */}
            <RadioGroup
              value={formData.taskType}
              onValueChange={(value) => handleInputChange("taskType", value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="main" id="main" />
                <Label htmlFor="main" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Main Task
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sub" id="sub" />
                <Label htmlFor="sub" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Sub Task
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Task Information Section */}
          <div className="space-y-4">
            {/* <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Task Information
            </h3> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectName">Project *</Label>
                <Select
                  value={formData.projectName}
                  onValueChange={(value) =>
                    handleInputChange("projectName", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.name}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectName && (
                  <p className="text-sm text-destructive">
                    {errors.projectName}
                  </p>
                )}
              </div>
            </div>

            {/* Parent Task Selection - Only for Sub Tasks */}
            {formData.taskType === "sub" && (
              <div className="space-y-2">
                <Label htmlFor="parentTaskId">Parent Task *</Label>
                <Select
                  value={formData.parentTaskId}
                  onValueChange={(value) =>
                    handleInputChange("parentTaskId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent task" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMainTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.parentTaskId && (
                  <p className="text-sm text-destructive">
                    {errors.parentTaskId}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Assignment Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Assignment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staffRole">Staff Role *</Label>
                <Select
                  value={formData.staffRole}
                  onValueChange={(value) =>
                    handleInputChange("staffRole", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff role" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.staffRole && (
                  <p className="text-sm text-destructive">{errors.staffRole}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To *</Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) =>
                    handleInputChange("assignedTo", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.name}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assignedTo && (
                  <p className="text-sm text-destructive">
                    {errors.assignedTo}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    handleInputChange("priority", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-sm text-destructive">{errors.priority}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Timeline Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.dueDate
                        ? formatDateForDisplay(formData.dueDate)
                        : "Select due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CustomCalendar
                      date={
                        formData.dueDate
                          ? new Date(formData.dueDate)
                          : new Date()
                      }
                      onDateChange={handleDueDateChange}
                      variant="inline"
                    />
                  </PopoverContent>
                </Popover>
                {errors.dueDate && (
                  <p className="text-sm text-destructive">{errors.dueDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="estimatedHours"
                    type="number"
                    placeholder="0"
                    value={formData.estimatedHours}
                    onChange={(e) =>
                      handleInputChange(
                        "estimatedHours",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="pl-10"
                    min="0"
                  />
                </div>
                {errors.estimatedHours && (
                  <p className="text-sm text-destructive">
                    {errors.estimatedHours}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualHours">Actual Hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="actualHours"
                    type="number"
                    placeholder="0"
                    value={formData.actualHours}
                    onChange={(e) =>
                      handleInputChange(
                        "actualHours",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="pl-10"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Attachments
            </h3>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-300 hover:border-slate-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-600 mb-2">
                Drag and drop files here, or click to select files
              </p>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Choose Files"}
              </label>
            </div>

            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  Selected Files
                </h4>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-primary shadow-primary"
            >
              {isLoading
                ? "Creating..."
                : `Create ${
                    formData.taskType === "sub" ? "Sub Task" : "Main Task"
                  }`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
