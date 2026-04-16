# Branch Management Refactoring - Contact Person Update

## Summary
The branch management system has been refactored to replace the "Contact Number" field with a "Set Contact Person" dropdown that displays branch admins.

## Changes Made

### Backend Updates

#### 1. Database Migration (add-contact-person-id.sql)
Added a new `contact_person_id` column to the `branches` table that references users:
```sql
ALTER TABLE branches
ADD COLUMN contact_person_id INT DEFAULT NULL,
ADD CONSTRAINT fk_contact_person 
FOREIGN KEY (contact_person_id) 
REFERENCES users(user_id) ON DELETE SET NULL;
```
**Action Required**: Run this migration before deploying.

#### 2.branchController.js Updates
- **createBranch()**: Removed `contact` from required fields and request handling
- **getBranches()**: Updated to return contact person details:
  - `contactPersonId`
  - `contactPersonFirstName`
  - `contactPersonLastName`
  - `contactPersonUsername`
  - `contactPersonContactNumber`
- **updateBranch()**: Changed to accept `contactPersonId` instead of `contact`
- **getBranchAdmins()** (NEW): Returns all active admins for a specific branch
  - Endpoint: `GET /api/branches/:branchId/admins`
  - Returns: Array of admins with first_name, last_name, username, contact_number

#### 3. branchRoutes.js Updates
- Added import for `getBranchAdmins`
- Added new route: `GET /:branchId/admins`

### Frontend Updates

#### 1. AddBranches.jsx
- ✅ Removed `contact` state variable
- ✅ Removed contact number input field completely
- ✅ Updated submission to NOT include contact field

#### 2. EditBranchModal.jsx
- ✅ Removed `contact` state
- ✅ Added `admins` state to store branch admins
- ✅ Added `selectedContactPersonId` state
- ✅ Added `fetchAdmins()` function that fetches admins for the branch
- ✅ Replaced contact number input with a "Set Contact Person" dropdown
- ✅ Dropdown displays: "FirstName LastName (username)"
- ✅ Updated form submission to send `contactPersonId` instead of `contact`
- ✅ Loads both locations and admins when modal opens

#### 3. BranchList.jsx
- ✅ Added `formatContactPerson()` helper function
- ✅ Updated branch card to display: "FirstName LastName (username) - ContactNumber"
- ✅ Shows "No contact person assigned" if no contact person is set

#### 4. ViewBranchModal.jsx
- ✅ Added `formatContactPerson()` helper function
- ✅ Replaced "Contact Number" display with contact person details
- ✅ Shows: "FirstName LastName (username) - ContactNumber"
- ✅ Shows "No contact person assigned" if no contact person is set

## User Flow Changes

### Before
- Admin creates branch → Enters contact number manually
- Edit branch → Modifies contact number input
- View branch → Sees contact number

### After
- Superadmin creates branch → No contact field needed
- Edit branch → Selects contact person from dropdown of active admins
- View/List branch → Sees contact person's full name, username, and contact number

## API Changes

### POST /api/branches (Create)
**Before**:
```json
{
  "branchName": "...",
  "contact": "+1234567890",
  "openingTime": "09:00",
  "closingTime": "22:00",
  "locationId": 1
}
```

**After**:
```json
{
  "branchName": "...",
  "openingTime": "09:00",
  "closingTime": "22:00",
  "locationId": 1
}
```

### PUT /api/branches/:id (Update)
**Before**:
```json
{
  "branchName": "...",
  "contact": "+1234567890",
  "openingTime": "09:00",
  "closingTime": "22:00",
  "locationId": 1
}
```

**After**:
```json
{
  "branchName": "...",
  "openingTime": "09:00",
  "closingTime": "22:00",
  "locationId": 1,
  "contactPersonId": 5
}
```

### GET /api/branches (New Response)
The response now includes:
- `contactPersonId` - User ID of the contact person
- `contactPersonFirstName` - First name of contact person
- `contactPersonLastName` - Last name of contact person
- `contactPersonUsername` - Username of contact person
- `contactPersonContactNumber` - Contact number of contact person

### GET /api/branches/:branchId/admins (NEW)
Returns all active admins for a branch:
```json
{
  "admins": [
    {
      "user_id": 2,
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "contact_number": "+1234567890",
      "status": "Activate"
    }
  ]
}
```

## Deployment Checklist

- [ ] Run the migration: `add-contact-person-id.sql`
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Test branch creation (no contact field)
- [ ] Test branch edit (contact person dropdown working)
- [ ] Test branch list/view (displaying contact person info correctly)
- [ ] Verify admins fetch correctly for each branch
