const LABEL = 'Grispi Plugin Showcase';
const GRISPI_API_URL = 'https://localhost:8443';
const grispi = Grispi.instance();
let isNewTicket = false;
let tenantId;
let lang;

grispi.init().then(bundle => {
  log('Plugin initialized.');
  console.log(LABEL, bundle);

  const context = bundle.context;
  const pluginSettings = bundle.settings;

  // If the app is loaded on a "New Ticket" tab then the ticketKey in the context object (context.ticketKey) is null
  const ticketKey = context.ticketKey;
  isNewTicket = ticketKey == null;
  tenantId = context.tenantId;
  lang = context.lang;

  updateUiWithContext(context);
  updateUiWithPluginSettings(pluginSettings);

  if (!isNewTicket) {
    const ticket = getTicket(ticketKey);

    // TODO UI initialization with ticket and requester info
  }
});

grispi.activeTicketChanged = function(ticketKey) {
  // Intentionally left blank
  // This should be an empty (no-op) function for right panel apps
}

grispi.currentTicketUpdated = function(ticketKey) {
  const ticket = getTicket(ticketKey);
  console.log(LABEL, 'ticket', ticket);
  // TODO UI update with updated ticket info
}

function updateUiWithContext(context) {
  if (isNewTicket) return;

  document.querySelector('input[name=ticket-key]').value = context.ticketKey;
  // TODO further UI updates...
}

function updateUiWithPluginSettings(pluginSettings) {
  document.body.style.backgroundColor = pluginSettings.bgColor;
  document.body.style.color = pluginSettings.textColor;
}

function log(message) {
  document.getElementById('log').innerText += `\n${new Date().toLocaleTimeString()} ${message}`;
}

async function getTicket(ticketKey) {

  // See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_your_own_request_object
  const response = await fetch(`${GRISPI_API_URL}/public/v1/tickets/${ticketKey}`, {
    method: "GET",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${grispi.apiToken()}`,
      "tenantId": tenantId
    }
  });
  // TODO error handling
  return response.json();
}