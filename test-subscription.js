const SUPABASE_URL = 'https://qzehfqvmdzmbqournxej.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6ZWhmcXZtZHptYnFvdXJueGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Nzc4MDIsImV4cCI6MjA3ODU1MzgwMn0.kq1ZzIZ-qEwIpADYQzDgfBlRDvT6rsHTkhSntVTHeuI';

async function testSubscriptionPlans() {
    try {
        console.log('Testing subscription plans retrieval...');
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/subscription-management`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                action: 'get_subscription_plans'
            })
        });
        
        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(data, null, 2));
        
        if (data.success && data.plans) {
            console.log('\n✅ Function is working!');
            console.log('Available plans:', data.plans.length);
            data.plans.forEach(plan => {
                console.log(`  - ${plan.plan_name}: €${plan.price_monthly}/month`);
            });
        } else {
            console.log('\n❌ Unexpected response format');
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testSubscriptionPlans();
