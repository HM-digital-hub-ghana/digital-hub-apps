import { Button } from "@web/components/ui/button";
import { Card } from "@web/components/ui/card";
import { ArrowRight, Calendar, Clock, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const projects = [
  {
    id: "smartspace",
    title: "Smartspace",
    description: "Conference Room & Visitor Booking System",
    icon: Calendar,
    path: "/conference-booking",
    enabled: true,
  },
  {
    id: "hm-clockr",
    title: "HM Clockr",
    description: "HR Management & Time Tracking",
    icon: Clock,
    path: "/hm-clockr",
    enabled: false,
  },
  {
    id: "complaints",
    title: "Complaints & Feedback",
    description: "Employee Feedback & Issue Reporting",
    icon: MessageSquare,
    path: "/complaints-feedback",
    enabled: false,
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  const handleProjectClick = (project: typeof projects[0]) => {
    if (project.enabled) {
      navigate(project.path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Digital Hub Apps
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Select a project to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => {
            const Icon = project.icon;
            return (
              <Card
                key={project.id}
                className={`p-6 cursor-pointer transition-all duration-200 ${
                  project.enabled
                    ? "hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
                    : "opacity-60 cursor-not-allowed border-2"
                }`}
                onClick={() => handleProjectClick(project)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div
                    className={`p-4 rounded-full ${
                      project.enabled
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {project.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {project.description}
                  </p>
                  <Button
                    disabled={!project.enabled}
                    className={`w-full ${
                      project.enabled
                        ? ""
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {project.enabled ? (
                      <>
                        Open App
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    ) : (
                      "Coming Soon"
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}





