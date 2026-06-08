export interface DealStage {
  id: string
  name: string
  order: number
  probability: number
  is_won: boolean
  is_lost: boolean
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  company_id: string
  company_name: string
  stage_id: string
  account_executive: string
  sdr: string | null
  value: number | null
  currency: string
  expected_close_date: string | null
  billing_date: string | null
  collection_date: string | null
  notes: string | null
  meeting_id: string | null
  lost_reason: string | null
  created_at: string
  updated_at: string
  event: string | null
  paquete_vendido: string | null
  name: string | null
}

export interface Company {
  id: string
  company_name: string
  domain: string | null
  industry: string | null
  size: string | null
  country: string | null
  status: string
  sdr: string | null
  icp_fit: string | null
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  company_id: string
  name: string
  role: string | null
  email: string | null
  phone: string | null
  created_at: string
}

export interface MeetingGoal {
  id: string
  iso_year: number
  iso_week: number
  account_executive: string
  goal: number
}

export interface Meeting {
  id: string
  company_id: string
  company_name: string
  account_executive: string
  sdr: string | null
  scheduled_at: string
  iso_year: number
  iso_week: number
  outcome: string | null
  created_at: string
}

export interface Activity {
  id: string
  type: string
  company_id: string
  company_name: string
  sdr: string | null
  from_status: string | null
  to_status: string | null
  contact_name: string | null
  created_at: string
}

export interface DashboardData {
  deals: Deal[]
  stages: DealStage[]
  companies: Company[]
  contacts: Contact[]
  meetingGoals: MeetingGoal[]
  meetings: Meeting[]
  activities: Activity[]
  lastUpdated: Date
}

export type Quarter = 1 | 2 | 3 | 4

export interface Filters {
  year: number
  quarter: Quarter | 'all'
  week: number | 'all'
}
