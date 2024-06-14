const LABEL = 'Grispi Plugin Showcase';
const GRISPI_API_URL = 'https://localhost:8443';
const grispiClient = GrispiClient.instance();
let isNewTicket = false;

grispiClient.init().then(bundle => {
  log('Plugin initialized.');
  console.log(LABEL, bundle);

  const context = bundle.context;
  const pluginSettings = bundle.settings;

  // If the app is loaded on a "New Ticket" tab then the ticketKey in the context object (context.ticketKey) is null
  const ticketKey = context.ticketKey;
  isNewTicket = ticketKey == null;

  updateUiWithContext(context);
  updateUiWithPluginSettings(pluginSettings);

  if (!isNewTicket) {
    const ticket = getTicket(ticketKey, context.token, context.tenantId);

    // TODO UI initialization with ticket and requester info
  }
});

grispiClient.activeTicketChanged = function(ticketKey) {
  // Intentionally left blank
}

grispiClient.currentTicketUpdated = function(ticketKey) {
  const ticket = getTicket('TICKET-1', context.token, context.tenantId);

  // TODO UI update with updated ticket info
}

function updateUiWithContext(context) {
  if (isNewTicket) return;

  document.querySelector('input[name=ticket-key]').value = context.ticketKey;
  document.querySelector('textarea[name=ticket-fields]').value = JSON.stringify(context.ticket.fieldMap, null, 2);
  // TODO further UI updates...
}

function updateUiWithPluginSettings(pluginSettings) {
  document.body.style.backgroundColor = pluginSettings.bgColor;
  document.body.style.color = pluginSettings.textColor;
}

function log(message) {
  document.getElementById('log').innerText += `\n${new Date().toLocaleTimeString()} ${message}`;
}

async function getTicket(ticketKey, token, tenantId) {

  // See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_your_own_request_object
  const response = await fetch(`${GRISPI_API_URL}/public/v1/tickets/${ticketKey}`, {
    method: "GET",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "tenantId": tenantId
    }
  });
  // TODO error handling
  const ticketJson = response.json();
  console.log(LABEL, 'ticket', ticketJson);
  return ticketJson;
}