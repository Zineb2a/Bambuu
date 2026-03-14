import { Link } from "react-router";
import { ArrowLeft, Target, Laptop, Plane, GraduationCap } from "lucide-react";
import Layout from "../components/Layout";

export default function Goals() {
  const goals = [
    { 
      id: '1', 
      name: 'New Laptop', 
      target: 1200, 
      current: 450, 
      icon: Laptop,
      color: 'bg-[#2d6a4f]'
    },
    { 
      id: '2', 
      name: 'Summer Trip', 
      target: 800, 
      current: 200, 
      icon: Plane,
      color: 'bg-[#52b788]'
    },
    { 
      id: '3', 
      name: 'Emergency Fund', 
      target: 1000, 
      current: 750, 
      icon: Target,
      color: 'bg-[#74c69d]'
    },
    { 
      id: '4', 
      name: 'Course Certification', 
      target: 300, 
      current: 150, 
      icon: GraduationCap,
      color: 'bg-[#95d5b2]'
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <div className="text-sm text-muted-foreground">Total Saved</div>
          <div className="text-3xl text-foreground">$1,550</div>
          <div className="text-sm text-muted-foreground mt-1">of $3,300 goal</div>
        </div>

        <h3 className="mb-4">Your Goals</h3>
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            const Icon = goal.icon;
            
            return (
              <div key={goal.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${goal.color} rounded-full flex items-center justify-center text-white`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <div className="font-medium">{goal.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${goal.current} of ${goal.target}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {progress.toFixed(0)}%
                  </div>
                </div>
                
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full ${goal.color} transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="mt-3 text-sm text-muted-foreground">
                  ${(goal.target - goal.current).toFixed(2)} left to reach goal
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-secondary border border-border rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
              <Target className="size-5" />
            </div>
            <div>
              <h4 className="mb-2">Stay Motivated!</h4>
              <p className="text-sm text-muted-foreground">
                You're making great progress! Small, consistent contributions add up over time. Keep up the good work! 🐼
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}