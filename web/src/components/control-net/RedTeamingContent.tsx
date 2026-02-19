'use client';

import { useState } from 'react';
import RedTeamingTab from './RedTeaming';

interface RedTeamingContentProps {
  initialTasks: any[];
}

export default function RedTeamingContent({ initialTasks }: RedTeamingContentProps) {
  const [tasks, setTasks] = useState<any[]>(initialTasks);

  const handleAddTask = (taskData?: any) => {
    const newTask = taskData || {
      id: `task-${Date.now()}`,
      name: `Task ${tasks.length + 1}`,
      status: 'pending',
    };
    setTasks([...tasks, newTask]);
  };

  return <RedTeamingTab tasks={tasks} onAddTask={handleAddTask} />;
}

