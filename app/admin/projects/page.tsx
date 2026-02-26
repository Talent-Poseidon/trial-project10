"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const ProjectPage = () => {
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !startDate || !endDate) {
      setAlert({ type: 'error', message: 'All fields are required.' });
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setAlert({ type: 'error', message: 'End date must be after start date' });
      return;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const newProject = await response.json();
      setProjects((prevProjects) => [...prevProjects, newProject]);
      setAlert({ type: 'success', message: 'Project created successfully' });
      // Reset form
      setProjectName('');
      setStartDate('');
      setEndDate('');
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  return (
    <div>
      <nav data-testid="project-page-nav">Projects</nav>
      <div data-testid="project-list-container">
        {projects.length > 0 ? (
          <ul>
            {projects.map((project) => (
              <li key={project.id}>{project.name}</li>
            ))}
          </ul>
        ) : (
          <p>No projects available</p>
        )}
      </div>
      <Button data-testid="new-project-btn" onClick={() => {}}>New Project</Button>
      <form onSubmit={handleSubmit}>
        <Input
          data-testid="project-name-input"
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
        />
        <Input
          data-testid="start-date-input"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <Input
          data-testid="end-date-input"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <Button data-testid="submit-project-btn" type="submit">Submit</Button>
      </form>
      {alert.message && (
        <Alert data-testid={alert.type === 'success' ? 'project-created-alert' : 'date-error-alert'}>
          <AlertTitle>{alert.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProjectPage;
