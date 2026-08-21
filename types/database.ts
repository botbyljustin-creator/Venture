// Hand-maintained Supabase Database type mirroring db/migrations/*.sql.
// Regenerate with `supabase gen types typescript` once your project is
// linked if you want a fully generated version.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Row<T> = {
  Row: T;
  Insert: Partial<T> & Record<string, unknown>;
  Update: Partial<T>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Row<{
        id: string;
        email: string;
        full_name: string | null;
        is_admin: boolean;
        stripe_customer_id: string | null;
        created_at: string;
        updated_at: string;
      }>;
      projects: Row<{
        id: string;
        user_id: string;
        name: string;
        template_slug: string | null;
        industry: string | null;
        business_type: string | null;
        country: string | null;
        region: string | null;
        city: string | null;
        service_radius: string | null;
        business_scope: string | null;
        status: string;
        generation_status: Json;
        is_sample: boolean;
        entitlement: string;
        venture_score: number | null;
        startup_cost: number | null;
        year1_revenue: number | null;
        year1_profit: number | null;
        breakeven_month: number | null;
        created_at: string;
        updated_at: string;
      }>;
      project_inputs: Row<{
        id: string;
        project_id: string;
        business_idea: string | null;
        location: Json;
        business_model: Json;
        owner_goals: Json;
        capital: Json;
        experience: Json;
        preferences: Json;
        wizard_step: number;
        completed_at: string | null;
        created_at: string;
        updated_at: string;
      }>;
      business_analyses: Row<{
        id: string;
        project_id: string;
        module: string;
        version: number;
        content: Json;
        model: string | null;
        created_at: string;
      }>;
      venture_scores: Row<{
        id: string;
        project_id: string;
        overall: number;
        label: string;
        verdict: string | null;
        profit_potential: number;
        cash_flow: number;
        scalability: number;
        owner_freedom: number;
        startup_efficiency: number;
        risk: number;
        breakdown: Json;
        created_at: string;
      }>;
      financial_assumptions: Row<{
        id: string;
        project_id: string;
        data: Json;
        version: number;
        created_at: string;
        updated_at: string;
      }>;
      startup_costs: Row<{
        id: string;
        project_id: string;
        items: Json;
        total: number;
        minimum: number;
        recommended: number;
        updated_at: string;
      }>;
      service_packages: Row<{
        id: string;
        project_id: string;
        packages: Json;
        updated_at: string;
      }>;
      financial_forecasts: Row<{
        id: string;
        project_id: string;
        unit_economics: Json;
        monthly: Json;
        yearly: Json;
        breakeven: Json;
        scenarios: Json;
        goal_reverse_engineering: Json;
        updated_at: string;
      }>;
      marketing_plans: Row<{
        id: string;
        project_id: string;
        channels: Json;
        content: Json;
        website_copy: Json;
        updated_at: string;
      }>;
      sales_kits: Row<{
        id: string;
        project_id: string;
        content: Json;
        updated_at: string;
      }>;
      launch_tasks: Row<{
        id: string;
        project_id: string;
        week: number;
        task: string;
        priority: string;
        estimated_time: string | null;
        status: string;
        sort_order: number;
        created_at: string;
      }>;
      risk_analyses: Row<{
        id: string;
        project_id: string;
        risks: Json;
        best_case: Json;
        expected_case: Json;
        worst_case: Json;
        updated_at: string;
      }>;
      ai_chat_messages: Row<{
        id: string;
        project_id: string;
        user_id: string;
        role: string;
        content: string;
        created_at: string;
      }>;
      subscriptions: Row<{
        id: string;
        user_id: string;
        stripe_customer_id: string;
        stripe_subscription_id: string | null;
        plan: string;
        status: string;
        current_period_end: string | null;
        cancel_at_period_end: boolean;
        created_at: string;
        updated_at: string;
      }>;
      purchases: Row<{
        id: string;
        user_id: string;
        project_id: string | null;
        stripe_payment_intent_id: string | null;
        stripe_checkout_session_id: string | null;
        plan: string;
        amount_cents: number;
        status: string;
        created_at: string;
      }>;
      ai_usage: Row<{
        id: string;
        user_id: string;
        project_id: string | null;
        feature: string;
        model: string;
        input_tokens: number;
        output_tokens: number;
        estimated_cost_cents: number;
        created_at: string;
      }>;
      exports: Row<{
        id: string;
        user_id: string;
        project_id: string;
        type: string;
        created_at: string;
      }>;
      admin_roles: Row<{
        user_id: string;
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
