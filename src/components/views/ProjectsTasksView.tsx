import React, { useState } from 'react';
import {
  KanbanSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  User,
  Layers,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { ProjectTask, TaskStatus, TaskPriority, RoleDefinition } from '../../types';

interface ProjectsTasksViewProps {
  tasks: ProjectTask[];
  currentRole: RoleDefinition;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (task: Omit<ProjectTask, 'id'>) => void;
}

export const ProjectsTasksView: React.FC<ProjectsTasksViewProps> = ({
  tasks,
  currentRole,
  onUpdateTaskStatus,
  onAddTask,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('high');
  const [newAssignee, setNewAssignee] = useState('Marcus Vance (CAM Engineer)');
  const [newLineProduct, setNewLineProduct] = useState('Line CNC-1 / AERO-VLV-992');
  const [newDueDate, setNewDueDate] = useState('2026-09-15');
  const [newHours, setNewHours] = useState(16);
  const [newTag, setNewTag] = useState('Tooling');

  const canWrite =
    currentRole.permissions.projects === 'admin' ||
    currentRole.permissions.projects === 'write';

  const columns: { id: TaskStatus; label: string; count: number }[] = [
    { id: 'backlog', label: 'Engineering Backlog', count: tasks.filter((t) => t.status === 'backlog').length },
    { id: 'spec_design', label: 'Spec & CAD Design', count: tasks.filter((t) => t.status === 'spec_design').length },
    { id: 'pilot_run', label: 'Tooling Pilot Run', count: tasks.filter((t) => t.status === 'pilot_run').length },
    { id: 'line_validation', label: 'Line Validation', count: tasks.filter((t) => t.status === 'line_validation').length },
    { id: 'completed', label: 'Released / Production', count: tasks.filter((t) => t.status === 'completed').length },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onUpdateTaskStatus(taskId, targetStatus);
      setDraggedTaskId(null);
    }
  };

  const handleSubmitNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      title: newTitle,
      description: newDescription,
      status: 'backlog',
      priority: newPriority,
      assignedTo: newAssignee,
      relatedLineOrProduct: newLineProduct,
      dueDate: newDueDate,
      estimatedHours: Number(newHours) || 8,
      completedHours: 0,
      tags: [newTag],
    });
    setNewTitle('');
    setNewDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5DE] p-6 rounded-3xl shadow-sm text-[#2D2D24]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif italic font-medium tracking-tight text-[#2D2D24] flex items-center gap-2.5">
              <KanbanSquare className="w-5 h-5 text-[#5A5A40]" />
              Manufacturing Projects &amp; Engineering Task Board
            </h1>
            <span className="text-xs bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-3 py-0.5 rounded-full font-semibold">
              Drag &amp; Drop Agile Kanban
            </span>
          </div>
          <p className="text-xs text-[#8B7E66] mt-1">
            Track engineering change orders (ECO), tooling fixture calibrations, CAM toolpath optimization, and line validation milestones.
          </p>
        </div>

        {canWrite && (
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-medium px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#E9E9E0]" />
            <span>New Engineering Task</span>
          </button>
        )}
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 select-none min-h-[600px]">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-[#E9E9E0]/40 border border-[#E5E5DE] rounded-3xl flex flex-col p-4 transition-colors hover:border-[#8B7E66]/50 shadow-xs"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E5DE]">
                <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider truncate">
                  {col.label}
                </span>
                <span className="text-[11px] font-mono bg-white text-[#2D2D24] border border-[#E5E5DE] px-2 py-0.5 rounded-full font-semibold shadow-xs">
                  {col.count}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="py-8 text-center text-[#A09E8E] text-xs border border-dashed border-[#C1C1B8] rounded-2xl bg-white/40">
                    Drop items here
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable={canWrite}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className={`p-4 bg-[#F9F9F7] rounded-2xl border-l-4 ${
                        task.priority === 'urgent'
                          ? 'border-[#B85D36]'
                          : task.priority === 'high'
                          ? 'border-[#8B7E66]'
                          : 'border-[#5A5A40]'
                      } shadow-sm transition-all space-y-2.5 ${
                        canWrite ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : 'cursor-default'
                      }`}
                    >
                      {/* Sub-label & Line Reference */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider truncate max-w-[120px]">
                          {task.relatedLineOrProduct || 'PROJECT'}
                        </span>
                        <span
                          className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-md ${
                            task.priority === 'urgent'
                              ? 'bg-[#B85D36]/15 text-[#B85D36]'
                              : task.priority === 'high'
                              ? 'bg-[#8B7E66]/20 text-[#8B7E66]'
                              : 'bg-[#E9E9E0] text-[#5A5A40]'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="font-semibold text-sm text-[#2D2D24] leading-tight">{task.title}</h4>
                        <p className="text-[11px] text-[#787668] line-clamp-2 mt-1">{task.description}</p>
                      </div>

                      {/* Assignee & Due Date */}
                      <div className="pt-2 border-t border-[#E5E5DE] flex items-center justify-between text-[11px] text-[#A09E8E]">
                        <span className="flex items-center gap-1 truncate max-w-[110px] text-[#2D2D24]">
                          <User className="w-3 h-3 text-[#8B7E66]" />
                          {task.assignedTo.split(' ')[0]}
                        </span>
                        <span className="text-[#8B7E66] font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#8B7E66]" />
                          {task.dueDate.slice(5)}
                        </span>
                      </div>

                      {/* Advance action button */}
                      {canWrite && col.id !== 'completed' && (
                        <div className="pt-1 flex items-center justify-end">
                          <button
                            onClick={() => {
                              const nextIndex = columns.findIndex((c) => c.id === col.id) + 1;
                              if (nextIndex < columns.length) {
                                onUpdateTaskStatus(task.id, columns[nextIndex].id);
                              }
                            }}
                            className="text-[10px] text-[#5A5A40] hover:text-[#2D2D24] flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E9E9E0] hover:bg-[#DDDDCF] font-semibold cursor-pointer transition-colors"
                            title="Advance to next phase"
                          >
                            <span>Next Stage</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl max-w-lg w-full p-6 text-[#2D2D24] space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-3">
              <h3 className="font-serif italic font-semibold text-lg text-[#5A5A40]">New Manufacturing Project Task</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#8B7E66] hover:text-[#2D2D24] text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitNewTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#5A5A40] font-bold mb-1">Task Title / Milestone</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 5-Axis CAM Rapid Feeds Recalibration"
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-bold mb-1">Detailed Objective</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe tooling adjustments, fixture validation, or cycle-time reduction targets..."
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A5A40] font-bold mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5A5A40] font-bold mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A5A40] font-bold mb-1">Assigned Engineer</label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-[#5A5A40] font-bold mb-1">Line / Part Reference</label>
                  <input
                    type="text"
                    value={newLineProduct}
                    onChange={(e) => setNewLineProduct(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E5E5DE]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] px-4 py-2 rounded-xl font-medium cursor-pointer border border-[#E5E5DE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
