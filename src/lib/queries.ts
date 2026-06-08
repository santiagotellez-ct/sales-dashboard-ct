import { supabase } from './supabase'
import type { Deal, DealStage, Company, Contact, MeetingGoal, Meeting, Activity } from '@/types'

export async function fetchDealStages(): Promise<DealStage[]> {
  const { data, error } = await supabase.from('deal_stages').select('*').order('order')
  if (error) throw new Error(`deal_stages: ${error.message}`)
  return data
}

export async function fetchDeals(): Promise<Deal[]> {
  const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(`deals: ${error.message}`)
  return data
}

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('id, company_name, domain, industry, size, country, status, sdr, icp_fit, created_at, updated_at')
  if (error) throw new Error(`companies: ${error.message}`)
  return data
}

export async function fetchContacts(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('id, company_id, name, role, email, phone, created_at')
  if (error) throw new Error(`contacts: ${error.message}`)
  return data
}

export async function fetchMeetingGoals(): Promise<MeetingGoal[]> {
  const { data, error } = await supabase.from('meeting_goals').select('*').order('iso_week')
  if (error) throw new Error(`meeting_goals: ${error.message}`)
  return data
}

export async function fetchMeetings(): Promise<Meeting[]> {
  const { data, error } = await supabase
    .from('meetings')
    .select('id, company_id, company_name, account_executive, sdr, scheduled_at, iso_year, iso_week, outcome, created_at')
    .order('scheduled_at', { ascending: false })
  if (error) throw new Error(`meetings: ${error.message}`)
  return data
}

export async function fetchActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(`activities: ${error.message}`)
  return data
}

export async function fetchAllDashboardData() {
  const [deals, stages, companies, contacts, meetingGoals, meetings, activities] = await Promise.all([
    fetchDeals(),
    fetchDealStages(),
    fetchCompanies(),
    fetchContacts(),
    fetchMeetingGoals(),
    fetchMeetings(),
    fetchActivities(),
  ])
  return { deals, stages, companies, contacts, meetingGoals, meetings, activities }
}
