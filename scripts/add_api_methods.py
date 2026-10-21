with open('client/src/services/api.js', 'r', encoding='utf-8') as f:
    text = f.read()

new_methods = """
// =============================================================
// Bids & Feasibility Pipeline API
// =============================================================
export const getBids = () => 
  api.get('/bids')
    .then(res => res.data)
    .catch(() => ({ success: true, data: [], summary: {} }));

export const createBid = (data) => 
  api.post('/bids', data)
    .then(res => res.data);

export const updateBidStatus = (id, status) => 
  api.post('/bids/status', { id, status })
    .then(res => res.data);

export const deleteBid = (id) => 
  api.delete('/bids/delete', { data: { id } })
    .then(res => res.data);

// =============================================================
// Team & Staff Management API
// =============================================================
export const getTeamMembers = () => 
  api.get('/team')
    .then(res => res.data)
    .catch(() => ({ success: true, data: [] }));

export const createTeamMember = (data) => 
  api.post('/team', data)
    .then(res => res.data);

export const updateTeamMemberStatus = (id, status) => 
  api.post('/team/status', { id, status })
    .then(res => res.data);

export const deleteTeamMember = (id) => 
  api.delete('/team/delete', { data: { id } })
    .then(res => res.data);
"""

if 'export const getBids' not in text:
    text += "\n" + new_methods
    with open('client/src/services/api.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("SUCCESS: Appended Bids & Team API methods to client/src/services/api.js")
else:
    print("Bids & Team methods already present")
