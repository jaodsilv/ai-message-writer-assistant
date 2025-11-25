/**
 * Job Hunting Storage
 * Stores companies, job descriptions, resumes, and applications
 */

import { readFile, writeFile, mkdir, readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import type { Company, JobDescription, Application, Resume } from '@/types/job-hunting';

function getDataPath(): string {
  return process.env.DATA_PATH || './data';
}

function getJobsPath(): string {
  return path.join(getDataPath(), 'jobs');
}

async function ensureJobsDirs(): Promise<void> {
  const dirs = ['companies', 'job-descriptions', 'applications', 'resumes'];

  for (const dir of dirs) {
    const dirPath = path.join(getJobsPath(), dir);
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }
  }
}

// ============ Companies ============

export async function createCompany(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
  await ensureJobsDirs();

  const now = new Date().toISOString();
  const company: Company = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const filePath = path.join(getJobsPath(), 'companies', `${company.id}.yaml`);
  await writeFile(filePath, yaml.dump(company), 'utf-8');

  return company;
}

export async function loadCompany(id: string): Promise<Company | null> {
  const filePath = path.join(getJobsPath(), 'companies', `${id}.yaml`);

  if (!existsSync(filePath)) {
    return null;
  }

  const content = await readFile(filePath, 'utf-8');
  return yaml.load(content) as Company;
}

export async function listCompanies(): Promise<Company[]> {
  await ensureJobsDirs();

  const companiesPath = path.join(getJobsPath(), 'companies');
  const files = await readdir(companiesPath);
  const yamlFiles = files.filter((f) => f.endsWith('.yaml'));

  const companies: Company[] = [];

  for (const file of yamlFiles) {
    const content = await readFile(path.join(companiesPath, file), 'utf-8');
    companies.push(yaml.load(content) as Company);
  }

  return companies.sort((a, b) => a.name.localeCompare(b.name));
}

// ============ Job Descriptions ============

export async function createJobDescription(
  data: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'>
): Promise<JobDescription> {
  await ensureJobsDirs();

  const now = new Date().toISOString();
  const job: JobDescription = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const filePath = path.join(getJobsPath(), 'job-descriptions', `${job.id}.yaml`);
  await writeFile(filePath, yaml.dump(job), 'utf-8');

  return job;
}

export async function loadJobDescription(id: string): Promise<JobDescription | null> {
  const filePath = path.join(getJobsPath(), 'job-descriptions', `${id}.yaml`);

  if (!existsSync(filePath)) {
    return null;
  }

  const content = await readFile(filePath, 'utf-8');
  return yaml.load(content) as JobDescription;
}

export async function listJobDescriptions(companyId?: string): Promise<JobDescription[]> {
  await ensureJobsDirs();

  const jobsPath = path.join(getJobsPath(), 'job-descriptions');
  const files = await readdir(jobsPath);
  const yamlFiles = files.filter((f) => f.endsWith('.yaml'));

  const jobs: JobDescription[] = [];

  for (const file of yamlFiles) {
    const content = await readFile(path.join(jobsPath, file), 'utf-8');
    const job = yaml.load(content) as JobDescription;

    if (!companyId || job.companyId === companyId) {
      jobs.push(job);
    }
  }

  return jobs.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ============ Applications ============

export async function createApplication(
  data: Omit<Application, 'id' | 'appliedAt' | 'lastActivityAt'>
): Promise<Application> {
  await ensureJobsDirs();

  const now = new Date().toISOString();
  const application: Application = {
    ...data,
    id: uuidv4(),
    appliedAt: now,
    lastActivityAt: now,
  };

  const filePath = path.join(getJobsPath(), 'applications', `${application.id}.yaml`);
  await writeFile(filePath, yaml.dump(application), 'utf-8');

  return application;
}

export async function loadApplication(id: string): Promise<Application | null> {
  const filePath = path.join(getJobsPath(), 'applications', `${id}.yaml`);

  if (!existsSync(filePath)) {
    return null;
  }

  const content = await readFile(filePath, 'utf-8');
  return yaml.load(content) as Application;
}

export async function updateApplication(
  id: string,
  updates: Partial<Application>
): Promise<Application | null> {
  const application = await loadApplication(id);

  if (!application) {
    return null;
  }

  const updated: Application = {
    ...application,
    ...updates,
    lastActivityAt: new Date().toISOString(),
  };

  const filePath = path.join(getJobsPath(), 'applications', `${id}.yaml`);
  await writeFile(filePath, yaml.dump(updated), 'utf-8');

  return updated;
}

export async function listApplications(status?: string): Promise<Application[]> {
  await ensureJobsDirs();

  const appsPath = path.join(getJobsPath(), 'applications');
  const files = await readdir(appsPath);
  const yamlFiles = files.filter((f) => f.endsWith('.yaml'));

  const applications: Application[] = [];

  for (const file of yamlFiles) {
    const content = await readFile(path.join(appsPath, file), 'utf-8');
    const app = yaml.load(content) as Application;

    if (!status || app.status === status) {
      applications.push(app);
    }
  }

  return applications.sort((a, b) =>
    new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  );
}

// ============ Resumes ============

export async function createResume(
  data: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Resume> {
  await ensureJobsDirs();

  const now = new Date().toISOString();
  const resume: Resume = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const filePath = path.join(getJobsPath(), 'resumes', `${resume.id}.yaml`);
  await writeFile(filePath, yaml.dump(resume), 'utf-8');

  return resume;
}

export async function loadResume(id: string): Promise<Resume | null> {
  const filePath = path.join(getJobsPath(), 'resumes', `${id}.yaml`);

  if (!existsSync(filePath)) {
    return null;
  }

  const content = await readFile(filePath, 'utf-8');
  return yaml.load(content) as Resume;
}

export async function listResumes(): Promise<Resume[]> {
  await ensureJobsDirs();

  const resumesPath = path.join(getJobsPath(), 'resumes');
  const files = await readdir(resumesPath);
  const yamlFiles = files.filter((f) => f.endsWith('.yaml'));

  const resumes: Resume[] = [];

  for (const file of yamlFiles) {
    const content = await readFile(path.join(resumesPath, file), 'utf-8');
    resumes.push(yaml.load(content) as Resume);
  }

  return resumes.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function deleteResume(id: string): Promise<boolean> {
  const filePath = path.join(getJobsPath(), 'resumes', `${id}.yaml`);

  if (!existsSync(filePath)) {
    return false;
  }

  await unlink(filePath);
  return true;
}
