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
    getTicket(ticketKey).then(ticket => {
        updateUiFields(ticket);
    }).catch(error => {
        log(`Failed to get ticket while initializing plugin: ${error}`)
    });
  }
});

grispi.activeTicketChanged = function(ticketKey) {
  // Intentionally left blank
  // This should be an empty (no-op) function for right panel apps
}

grispi.currentTicketUpdated = function(ticketKey) {
  log('Ticket updated.');
  getTicket(ticketKey).then(ticket => {
      updateUiFields(ticket);
      const requesterId = +ticket.fieldMap['ts.requester'].value;
      getUser(requesterId).then((user) => {
          const requesterFullName = (user.firstName ?? '') + ' ' + (user.lastName ?? '');
          setRequester(user.id, requesterFullName, user.primaryEmail, user.primaryPhone);
      }).catch(error => {
          log(`Failed to update requester fields: ${error}`)
          setRequester('', '', '', '');
      });
  }).catch(error => {
      log(`Failed to get ticket while initializing plugin: ${error}`);
  });
}

function updateUiFields(ticket) {
    const fields = Object.entries(ticket.fieldMap)
        .map(([_, { key, value }]) => key === 'ts.description' ? `${key}: <redacted>` : `${key}: ${value}`)
        .join('\n');
    document.querySelector('textarea[name=ticket-fields]').value = fields;
}

function updateUiWithContext(context) {
  if (isNewTicket) return;

  document.querySelector('input[name=ticket-key]').value = context.ticketKey;

  if (context.agent) {
      document.querySelector('input[name=user-id]').value = context.agent.id;
      document.querySelector('input[name=user-full-name]').value = context.agent.fullName;
      document.querySelector('input[name=user-email]').value = context.agent.email;
      document.querySelector('input[name=user-phone]').value = context.agent.phone;
  }

  if (context.requester) {
      setRequester(context.requester.id, context.requester.fullName, context.requester.email, context.requester.phone);
  }

  // TODO further UI updates...
}

function updateUiWithPluginSettings(pluginSettings) {
  document.body.style.backgroundColor = pluginSettings.bgColor;
  document.body.style.color = pluginSettings.textColor;
}

function log(message) {
  document.getElementById('log').innerText += `\n${new Date().toLocaleTimeString()} ${message}`;
}

function setRequester(id, name, email, phone) {
    document.querySelector('input[name=requester-id]').value = id;
    document.querySelector('input[name=requester-full-name]').value = name;
    document.querySelector('input[name=requester-email]').value = email;
    document.querySelector('input[name=requester-phone]').value = phone;
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
  return response.json();
}

async function getUser(id) {
    const response = await fetch(`${GRISPI_API_URL}/public/v1/users/${id}`, {
        method: "GET",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${grispi.apiToken()}`,
            "tenantId": tenantId
        }
    });
    return response.json();
}