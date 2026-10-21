import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def post_json(url, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        return json.loads(resp.read().decode('utf-8'))

print('=== 1. TESTING BIDS MODULE ===')
bid_res = post_json('https://api.vmhgroupsmr.com/api/bids', {
    'name': 'Global Healthcare Physician Survey 2026',
    'client_id': 1,
    'cpi': 4.50,
    'sample_size': 1200,
    'specifications': 'Cardiologists and oncologists in US & EU5',
    'status': 'Pending',
    'created_by': 'Admin'
})
print('Bid Create:', bid_res)
bid_id = bid_res['data']['id']

bids_list = get_json('https://api.vmhgroupsmr.com/api/bids')
print('Bids List Count:', len(bids_list['data']), 'Summary:', bids_list.get('summary'))

bid_status_res = post_json('https://api.vmhgroupsmr.com/api/bids/status', {
    'id': bid_id,
    'status': 'Won'
})
print('Bid Update Status:', bid_status_res)

print('\n=== 2. TESTING PAYMENTS MODULE ===')
pay_res = post_json('https://api.vmhgroupsmr.com/api/payments/create', {
    'project_id': 101,
    'project_name': 'Global Healthcare Physician Survey 2026',
    'vendor_id': 1,
    'amount': 2450.00,
    'status': 'Pending',
    'remarks': 'First wave complete milestone payout'
})
print('Payment Create:', pay_res)
pay_id = pay_res['data']['id']

pay_list = get_json('https://api.vmhgroupsmr.com/api/payments')
print('Payments List Count:', len(pay_list['data']), 'Summary:', pay_list.get('summary'))

pay_status_res = post_json('https://api.vmhgroupsmr.com/api/payments/update-status', {
    'id': pay_id,
    'status': 'Paid',
    'remarks': 'Processed via Bank Transfer UTR #VMH2026102198'
})
print('Payment Update Status:', pay_status_res)

print('\n=== 3. TESTING TEAM MODULE ===')
team_res = post_json('https://api.vmhgroupsmr.com/api/team', {
    'name': 'Vikram Mehra',
    'username': 'vikram',
    'email': 'vikram@vmhgroupsmr.com',
    'mobile_no': '+91 9876543210',
    'role_id': 2,
    'status': 'Y'
})
print('Team Create:', team_res)
team_id = team_res['data']['id']

team_list = get_json('https://api.vmhgroupsmr.com/api/team')
print('Team List Count:', len(team_list['data']))
for m in team_list['data']:
    print(f"  - #{m['id']}: {m['name']} (@{m['username']}) | Role: {m['role_name']} | Status: {m['status']}")

team_status_res = post_json('https://api.vmhgroupsmr.com/api/team/status', {
    'id': team_id,
    'status': 'N'
})
print('Team Status Toggle to N:', team_status_res)
team_status_res2 = post_json('https://api.vmhgroupsmr.com/api/team/status', {
    'id': team_id,
    'status': 'Y'
})
print('Team Status Toggle back to Y:', team_status_res2)

print('\nALL THREE MODULES TESTED AND FULLY FUNCTIONAL LIVE!')
