import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

export async function POST({ request, locals }) {
  try {
    const data = await request.json();
    const { name, email, phone, message, propertyId, propertyTitle, pageUrl } = data;

    if (!name || (!email && !phone)) {
      return json({ success: false, error: 'Por favor proporciona tu nombre y un correo o teléfono de contacto.' }, { status: 400 });
    }

    const recipientEmail = 'matchhomebr@gmail.com';
    const timestamp = new Date().toLocaleString('es-MX', { timeZone: 'America/Chihuahua' });

    // Clean phone number for WhatsApp direct link
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.length === 10 ? '52' + cleanPhone : cleanPhone}` : null;

    // 1. Store lead in Firestore if db is connected
    const db = locals.db;
    if (db) {
      try {
        await db.collection('leads').add({
          name: name || 'Sin nombre',
          email: email || '',
          phone: phone || '',
          message: message || '',
          propertyId: propertyId || null,
          propertyTitle: propertyTitle || null,
          pageUrl: pageUrl || null,
          createdAt: new Date(),
          timestampStr: timestamp,
          status: 'nuevo'
        });
        console.log('✅ Lead guardado exitosamente en Firestore');
      } catch (dbErr) {
        console.error('Error al guardar el lead en Firestore:', dbErr.message);
      }
    }

    // 2. Build Email HTML Template
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #0056b3; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">🏠 Nuevo Interés de Cliente</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">MatchHome CRM - Solicitud de Información</p>
        </div>
        
        <div style="padding: 24px;">
          <h3 style="color: #0056b3; margin-top: 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px;">Datos del Contacto</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 140px; font-weight: bold;">👤 Nombre:</td>
              <td style="padding: 8px 0; color: #333; font-size: 16px;"><strong>${name}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">✉️ Correo:</td>
              <td style="padding: 8px 0; color: #333;"><a href="mailto:${email}" style="color: #0056b3;">${email || 'No proporcionado'}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">📞 Teléfono:</td>
              <td style="padding: 8px 0; color: #333;">
                ${phone ? `<strong>${phone}</strong>` : 'No proporcionado'}
                ${whatsappUrl ? ` &nbsp;<a href="${whatsappUrl}" target="_blank" style="background-color: #25D366; color: white; padding: 4px 10px; border-radius: 12px; text-decoration: none; font-size: 12px; font-weight: bold;">💬 Abrir WhatsApp</a>` : ''}
              </td>
            </tr>
            ${propertyTitle ? `
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">🏡 Propiedad:</td>
              <td style="padding: 8px 0; color: #333;"><strong>${propertyTitle}</strong> ${propertyId ? `(${propertyId})` : ''}</td>
            </tr>
            ` : ''}
            ${pageUrl ? `
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">🔗 Página:</td>
              <td style="padding: 8px 0;"><a href="${pageUrl}" target="_blank" style="color: #0056b3;">Ver propiedad en la web</a></td>
            </tr>
            ` : ''}
          </table>

          ${message ? `
          <div style="background-color: #f8f9fa; border-left: 4px solid #0056b3; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <strong style="color: #555; display: block; margin-bottom: 5px;">💬 Mensaje / Horario preferido:</strong>
            <p style="margin: 0; color: #333; white-space: pre-line; font-style: italic;">"${message}"</p>
          </div>
          ` : ''}

          <div style="font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 12px; margin-top: 24px;">
            📅 Fecha de recepción: ${timestamp}
          </div>
        </div>
      </div>
    `;

    // 3. Email Delivery Setup
    const emailUser = env.EMAIL_USER || process.env.EMAIL_USER || 'matchhomebr@gmail.com';
    const emailPass = env.EMAIL_PASS || process.env.EMAIL_PASS || env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
    const resendApiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;

    let emailSent = false;

    // Method A: Resend API (if API Key provided)
    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'MatchHome <onboarding@resend.dev>',
            to: [recipientEmail],
            subject: `🏠 Nuevo Interés de Cliente: ${name} - ${propertyTitle || 'MatchHome'}`,
            html: htmlContent
          })
        });
        if (resendRes.ok) {
          emailSent = true;
          console.log('✅ Correo enviado con éxito vía Resend API');
        }
      } catch (resendErr) {
        console.error('Error con Resend API:', resendErr);
      }
    }

    // Method B: Nodemailer SMTP (Gmail / Custom SMTP)
    if (!emailSent && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        });

        await transporter.sendMail({
          from: `"MatchHome Site" <${emailUser}>`,
          to: recipientEmail,
          replyTo: email || emailUser,
          subject: `🏠 Nuevo Interés de Cliente: ${name} - ${propertyTitle || 'MatchHome'}`,
          html: htmlContent
        });

        emailSent = true;
        console.log('✅ Correo enviado con éxito vía Nodemailer SMTP');
      } catch (smtpErr) {
        console.error('Error enviando correo vía Nodemailer:', smtpErr.message);
      }
    }

    if (!emailSent) {
      console.warn('⚠️ No se configuró un password o API de correo (EMAIL_PASS o GMAIL_APP_PASSWORD en .env). El lead fue guardado en la base de datos.');
    }

    return json({
      success: true,
      message: 'Información recibida y enviada correctamente.',
      emailSent
    });

  } catch (err) {
    console.error('Error en /api/contact:', err);
    return json({ success: false, error: 'Ocurrió un error inesperado al procesar la solicitud.' }, { status: 500 });
  }
}
