import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || "MyCal <onboarding@resend.dev>";

function formatDate(date) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const baseEmailStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #111827;
  line-height: 1.6;
  background-color: #f9fafb;
`;

const containerStyle = `
  background-color: #ffffff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
`;

const headerIcon = `
  <div style="width: 48px; height: 48px; border-radius: 50%; background-color: #d1fae5; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  </div>
`;

const cancelIcon = `
  <div style="width: 48px; height: 48px; border-radius: 50%; background-color: #fee2e2; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </div>
`;

function renderRow(label, content, isLink = false) {
  if (!content) return "";
  const contentStyle = isLink ? 'color: #2563eb; text-decoration: underline;' : 'color: #374151;';
  return `
    <div style="margin-bottom: 24px;">
      <p style="font-weight: 600; font-size: 15px; margin: 0 0 8px 0; color: #111827;">${label}</p>
      <p style="margin: 0; font-size: 15px; ${contentStyle}">
        ${isLink ? `<a href="${content}" style="${contentStyle}">${content}</a>` : content}
      </p>
    </div>
  `;
}

function renderAttendees(hostName, hostEmail, bookerName, bookerEmail) {
  return `
    <div style="margin-bottom: 24px;">
      <p style="font-weight: 600; font-size: 15px; margin: 0 0 8px 0; color: #111827;">Who</p>
      <p style="margin: 0 0 4px 0; font-size: 15px; color: #374151;">
        ${hostName} - Organizer <a href="mailto:${hostEmail}" style="color: #6b7280; text-decoration: none;">${hostEmail}</a>
      </p>
      <p style="margin: 0; font-size: 15px; color: #374151;">
        ${bookerName} - Guest <a href="mailto:${bookerEmail}" style="color: #6b7280; text-decoration: none;">${bookerEmail}</a>
      </p>
    </div>
  `;
}

export async function sendBookerConfirmation({
  bookerName,
  bookerEmail,
  hostName,
  hostEmail,
  eventTitle,
  date,
  startTime,
  endTime,
  meetLink,
}) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: bookerEmail,
      subject: `Your meeting with ${hostName} is confirmed`,
      html: `
        <div style="${baseEmailStyle}">
          <div style="${containerStyle}">
            ${headerIcon}
            <h2 style="color: #111827; text-align: center; font-size: 24px; margin-bottom: 32px;">A new event has been scheduled.</h2>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            
            ${renderRow('What', `${eventTitle} between ${hostName} and ${bookerName}`)}
            ${renderRow('When', `${formatDate(date)} | ${startTime} - ${endTime}`)}
            ${renderAttendees(hostName, hostEmail, bookerName, bookerEmail)}
            ${renderRow('Where', 'Jitsi Meeting')}
            ${renderRow('Meeting URL', meetLink, true)}
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            
            <p style="text-align: center; color: #6b7280; font-size: 14px; margin: 0;">
              Need to make a change? <a href="#" style="color: #6b7280; text-decoration: underline;">Reschedule</a> or <a href="#" style="color: #6b7280; text-decoration: underline;">Cancel</a>
            </p>
          </div>
        </div>
      `,
    });
    console.log(`[Resend Log] Booker Confirmation to ${bookerEmail} ->`, result.error ? `Failed: ${JSON.stringify(result.error)}` : `Success: ${result.data?.id}`);
  } catch (error) {
    console.error(`[Resend Error] Booker Confirmation to ${bookerEmail}:`, error);
  }
}

export async function sendHostNotification({
  hostName,
  hostEmail,
  bookerName,
  bookerEmail,
  eventTitle,
  date,
  startTime,
  endTime,
  note,
  meetLink,
}) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: hostEmail,
      subject: `New booking: ${eventTitle} with ${bookerName}`,
      html: `
        <div style="${baseEmailStyle}">
          <div style="${containerStyle}">
            ${headerIcon}
            <h2 style="color: #111827; text-align: center; font-size: 24px; margin-bottom: 32px;">A new event has been scheduled.</h2>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            
            ${renderRow('What', `${eventTitle} between ${hostName} and ${bookerName}`)}
            ${renderRow('When', `${formatDate(date)} | ${startTime} - ${endTime}`)}
            ${renderAttendees(hostName, hostEmail, bookerName, bookerEmail)}
            ${renderRow('Where', 'Jitsi Meeting')}
            ${renderRow('Meeting URL', meetLink, true)}
            ${note ? renderRow('Additional notes', note) : ''}
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            
            <p style="text-align: center; color: #6b7280; font-size: 14px; margin: 0;">
              Need to make a change? <a href="#" style="color: #6b7280; text-decoration: underline;">Reschedule</a> or <a href="#" style="color: #6b7280; text-decoration: underline;">Cancel</a>
            </p>
          </div>
        </div>
      `,
    });
    console.log(`[Resend Log] Host Notification to ${hostEmail} ->`, result.error ? `Failed: ${JSON.stringify(result.error)}` : `Success: ${result.data?.id}`);
  } catch (error) {
    console.error(`[Resend Error] Host Notification to ${hostEmail}:`, error);
  }
}

export async function sendCancellationEmails({
  bookerName,
  bookerEmail,
  hostName,
  hostEmail,
  eventTitle,
  date,
  startTime,
  endTime,
}) {
  const formattedDate = formatDate(date);

  try {
    const results = await Promise.all([
      resend.emails.send({
        from: FROM_EMAIL,
        to: bookerEmail,
        subject: `Meeting cancelled: ${eventTitle} with ${hostName}`,
        html: `
          <div style="${baseEmailStyle}">
            <div style="${containerStyle}">
              ${cancelIcon}
              <h2 style="color: #111827; text-align: center; font-size: 24px; margin-bottom: 32px;">A meeting has been cancelled.</h2>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
              
              ${renderRow('What', `${eventTitle} between ${hostName} and ${bookerName}`)}
              ${renderRow('When', `${formatDate(date)} | ${startTime} - ${endTime}`)}
              ${renderAttendees(hostName, hostEmail, bookerName, bookerEmail)}
              
            </div>
          </div>
        `,
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: hostEmail,
        subject: `Booking cancelled: ${eventTitle} with ${bookerName}`,
        html: `
          <div style="${baseEmailStyle}">
            <div style="${containerStyle}">
              ${cancelIcon}
              <h2 style="color: #111827; text-align: center; font-size: 24px; margin-bottom: 32px;">A meeting has been cancelled.</h2>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
              
              ${renderRow('What', `${eventTitle} between ${hostName} and ${bookerName}`)}
              ${renderRow('When', `${formatDate(date)} | ${startTime} - ${endTime}`)}
              ${renderAttendees(hostName, hostEmail, bookerName, bookerEmail)}
              
            </div>
          </div>
        `,
      }),
    ]);
    console.log(`[Resend Log] Cancellation Emails -> Booker: ${results[0].error ? 'Failed' : 'Success'}, Host: ${results[1].error ? 'Failed' : 'Success'}`);
  } catch (error) {
    console.error(`[Resend Error] Cancellation Emails:`, error);
  }
}

export async function sendRescheduleEmails({
  bookerName,
  bookerEmail,
  hostName,
  hostEmail,
  eventTitle,
  oldDate,
  oldStartTime,
  newDate,
  newStartTime,
  newEndTime,
  meetLink,
}) {
  const oldFormattedDate = formatDate(oldDate);
  const newFormattedDate = formatDate(newDate);

  try {
    const results = await Promise.all([
      resend.emails.send({
        from: FROM_EMAIL,
        to: bookerEmail,
        subject: `Meeting rescheduled: ${eventTitle} with ${hostName}`,
        html: `
          <div style="${baseEmailStyle}">
            <div style="${containerStyle}">
              ${headerIcon}
              <h2 style="color: #111827; text-align: center; font-size: 24px; margin-bottom: 32px;">A meeting has been rescheduled.</h2>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
              
              ${renderRow('What', `${eventTitle} between ${hostName} and ${bookerName}`)}
              ${renderRow('When', `${formatDate(newDate)} | ${newStartTime} - ${newEndTime} <br><span style="color: #9ca3af; text-decoration: line-through; font-size: 13px;">Was: ${formatDate(oldDate)} | ${oldStartTime}</span>`)}
              ${renderAttendees(hostName, hostEmail, bookerName, bookerEmail)}
              ${renderRow('Where', 'Jitsi Meeting')}
              ${renderRow('Meeting URL', meetLink, true)}
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
              
              <p style="text-align: center; color: #6b7280; font-size: 14px; margin: 0;">
                Need to make a change? <a href="#" style="color: #6b7280; text-decoration: underline;">Reschedule</a> or <a href="#" style="color: #6b7280; text-decoration: underline;">Cancel</a>
              </p>
            </div>
          </div>
        `,
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: hostEmail,
        subject: `Booking rescheduled: ${eventTitle} with ${bookerName}`,
        html: `
          <div style="${baseEmailStyle}">
            <div style="${containerStyle}">
              ${headerIcon}
              <h2 style="color: #111827; text-align: center; font-size: 24px; margin-bottom: 32px;">A meeting has been rescheduled.</h2>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
              
              ${renderRow('What', `${eventTitle} between ${hostName} and ${bookerName}`)}
              ${renderRow('When', `${formatDate(newDate)} | ${newStartTime} - ${newEndTime} <br><span style="color: #9ca3af; text-decoration: line-through; font-size: 13px;">Was: ${formatDate(oldDate)} | ${oldStartTime}</span>`)}
              ${renderAttendees(hostName, hostEmail, bookerName, bookerEmail)}
              ${renderRow('Where', 'Jitsi Meeting')}
              ${renderRow('Meeting URL', meetLink, true)}
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
              
              <p style="text-align: center; color: #6b7280; font-size: 14px; margin: 0;">
                Need to make a change? <a href="#" style="color: #6b7280; text-decoration: underline;">Reschedule</a> or <a href="#" style="color: #6b7280; text-decoration: underline;">Cancel</a>
              </p>
            </div>
          </div>
        `,
      }),
    ]);
    console.log(`[Resend Log] Reschedule Emails -> Booker: ${results[0].error ? 'Failed' : 'Success'}, Host: ${results[1].error ? 'Failed' : 'Success'}`);
  } catch (error) {
    console.error(`[Resend Error] Reschedule Emails:`, error);
  }
}
