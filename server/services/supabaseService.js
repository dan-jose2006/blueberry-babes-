'use strict';

const _supabase = require('../config/supabase');

// Provide a clear error if env vars are missing rather than a cryptic null crash
function getClient() {
  if (!_supabase) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.');
  }
  return _supabase;
}

const logger = { 
  info: (...a) => console.log('[INFO]', ...a),
  error: (...a) => console.error('[ERROR]', ...a),
};

// ── Students ──────────────────────────────────────────────────────────────────

async function createStudent(data) {
  const { data: student, error } = await getClient()
    .from('students')
    .insert([{
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone || null,
      branch: data.branch || null,
      semester: data.semester || null,
      roll_no: data.rollNo || null,
    }])
    .select()
    .single();

  if (error) {
    logger.error(`createStudent failed: ${error.message}`);
    throw new Error(error.message);
  }
  return student;
}

async function getStudentByEmail(email) {
  const { data, error } = await getClient()
    .from('students')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    logger.error(`getStudentByEmail failed: ${error.message}`);
    throw new Error(error.message);
  }
  return data || null;
}

async function upsertStudent(data) {
  const { data: student, error } = await getClient()
    .from('students')
    .upsert([{
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone || null,
      branch: data.branch || null,
      semester: data.semester || null,
      roll_no: data.rollNo || null,
    }], { onConflict: 'email' })
    .select()
    .single();

  if (error) {
    logger.error(`upsertStudent failed: ${error.message}`);
    throw new Error(error.message);
  }
  return student;
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

async function createTask(data) {
  const { data: task, error } = await getClient()
    .from('tasks')
    .insert([{
      student_id: data.studentId || null,
      title: data.title.trim(),
      subject: data.subject.trim(),
      description: data.description || null,
      deadline: new Date(data.deadline).toISOString(),
      priority: data.priority || 'medium',
      difficulty: data.difficulty || 'medium',
      estimated_hours: data.estimatedHours || 4,
      completion_percent: data.completionPercent || 0,
      study_plan: data.studyPlan || null,
      ai_stats: data.aiStats || null,
    }])
    .select()
    .single();

  if (error) {
    logger.error(`createTask failed: ${error.message}`);
    throw new Error(error.message);
  }
  logger.info(`Task created: ${task.id} — "${task.title}"`);
  return task;
}

async function getTasks(studentId = null) {
  let query = getClient()
    .from('tasks')
    .select('*')
    .order('deadline', { ascending: true });

  if (studentId) {
    query = query.eq('student_id', studentId);
  }

  const { data, error } = await query;
  if (error) {
    logger.error(`getTasks failed: ${error.message}`);
    throw new Error(error.message);
  }
  return data;
}

async function getTaskById(id) {
  const { data, error } = await getClient()
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error(`getTaskById failed: ${error.message}`);
    throw new Error(error.message);
  }
  return data;
}

async function updateTask(id, updates) {
  const allowed = [
    'title', 'subject', 'description', 'deadline', 'priority',
    'difficulty', 'estimated_hours', 'completion_percent', 'study_plan', 'ai_stats',
  ];

  // Build clean update object
  const patch = {};
  if (updates.title) patch.title = updates.title.trim();
  if (updates.subject) patch.subject = updates.subject.trim();
  if (updates.description !== undefined) patch.description = updates.description;
  if (updates.deadline) patch.deadline = new Date(updates.deadline).toISOString();
  if (updates.priority) patch.priority = updates.priority;
  if (updates.difficulty) patch.difficulty = updates.difficulty;
  if (updates.estimatedHours !== undefined) patch.estimated_hours = updates.estimatedHours;
  if (updates.completionPercent !== undefined) patch.completion_percent = updates.completionPercent;
  if (updates.studyPlan !== undefined) patch.study_plan = updates.studyPlan;
  if (updates.aiStats !== undefined) patch.ai_stats = updates.aiStats;
  patch.updated_at = new Date().toISOString();

  const { data, error } = await getClient()
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error(`updateTask failed: ${error.message}`);
    throw new Error(error.message);
  }
  logger.info(`Task updated: ${id}`);
  return data;
}

async function deleteTask(id) {
  const { error } = await getClient()
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error(`deleteTask failed: ${error.message}`);
    throw new Error(error.message);
  }
  logger.info(`Task deleted: ${id}`);
  return true;
}

// ── Automation Logs ───────────────────────────────────────────────────────────

async function logAutomation({ taskId, webhookType, status, payload, response }) {
  const { data, error } = await getClient()
    .from('automation_logs')
    .insert([{
      task_id: taskId,
      webhook_type: webhookType,
      status,
      payload: payload || null,
      response: response || null,
    }])
    .select()
    .single();

  if (error) {
    logger.error(`logAutomation failed: ${error.message}`);
    // Don't throw — logging failure should not break the main flow
    return null;
  }
  return data;
}

async function getAutomationLogs(taskId = null) {
  let query = getClient()
    .from('automation_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (taskId) query = query.eq('task_id', taskId);

  const { data, error } = await query;
  if (error) {
    logger.error(`getAutomationLogs failed: ${error.message}`);
    throw new Error(error.message);
  }
  return data;
}

module.exports = {
  createStudent,
  getStudentByEmail,
  upsertStudent,
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  logAutomation,
  getAutomationLogs,
};
