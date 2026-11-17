/**
 * ============================================================================
 * TravelIQ Google Apps Script — ACCESS CONTROL (add-on file)
 * ============================================================================
 *
 * Use this when you are not certain the script currently deployed matches
 * google-apps-script.js in this repo. It locks the admin actions WITHOUT
 * replacing any of your existing code, whatever that code looks like.
 *
 * WHY: the web app is deployed with access "Anyone" so the public site can
 * file leads. Until this is installed, anyone on the internet can read every
 * lead (names, emails, agencies) with a single GET request, and can create or
 * delete blog posts.
 *
 * INSTALL (about 5 minutes):
 *
 * 1. Open the Apps Script project. In your EXISTING code file make exactly two
 *    renames, changing nothing else:
 *        function doGet(e)   ->  function handleGet_(e)
 *        function doPost(e)  ->  function handlePost_(e)
 *
 * 2. Click  +  next to "Files" > Script. Name it  AccessControl . Delete the
 *    placeholder code and paste this entire file. Save.
 *
 * 3. Project Settings (gear icon) > Script Properties > Add script property
 *        Property:  ADMIN_SECRET
 *        Value:     the long random value you also saved in Cloudflare as
 *                   SHEETS_ADMIN_SECRET
 *    Save script properties.
 *
 * 4. Deploy > Manage deployments > pencil (edit) on the existing deployment
 *        Version:          New version
 *        Execute as:       Me
 *        Who has access:   Anyone
 *    Deploy. The URL does not change.
 *
 * 5. Check it worked: open  <your /exec URL>?action=getLeads  in a private
 *    browser window. You must see  {"success":false,"message":"Not authorised"}
 *    and no lead data.
 * ============================================================================
 */

// Actions only TravelIQ's server may call. Everything not listed stays public.
var ADMIN_ACTIONS = [
  'getLeads',           // personal data: agent names, emails, agencies
  'getVeeChatHistory',  // every visitor's chat with Vee
  'getSuppliers',       // legacy sheet, not used by the site
  'saveSuppliers',      // legacy write, not used by the site
  'saveBlogPost',
  'deleteBlogPost'
];

// Admin actions your existing code serves from its GET handler. They are now
// reachable only by POST with the secret, and are passed on to that handler.
var ADMIN_READS = ['getLeads', 'getVeeChatHistory', 'getSuppliers'];

function isAdminRequest_(secret) {
  var expected = PropertiesService.getScriptProperties().getProperty('ADMIN_SECRET');
  // No secret configured = nobody is an admin. Never fall open.
  return !!expected && typeof secret === 'string' && secret === expected;
}

function denied_() {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, message: 'Not authorised' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// PUBLIC reads. Admin actions are never served over GET: Apps Script cannot
// read request headers, and a secret in a URL would end up in logs.
function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : '';
  if (ADMIN_ACTIONS.indexOf(action) !== -1) return denied_();
  return handleGet_(e);
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return denied_();
  }
  var action = body.action;

  // Public writes (addLead, addVeeChatMessage, ...) pass straight through.
  if (ADMIN_ACTIONS.indexOf(action) === -1) return handlePost_(e);

  if (!isAdminRequest_(body.secret)) return denied_();

  if (ADMIN_READS.indexOf(action) !== -1) {
    return handleGet_({ parameter: { action: action } });
  }
  return handlePost_(e);
}
