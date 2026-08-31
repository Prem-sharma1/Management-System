import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { phoneNumber, salesPersonId } = body;

    if (!phoneNumber || !salesPersonId) {
      return NextResponse.json({ error: 'Missing phoneNumber or salesPersonId' }, { status: 400 });
    }

    const salesperson = await prisma.user.findUnique({
      where: { id: parseInt(salesPersonId, 10) }
    });

    if (!salesperson || !salesperson.mobile) {
      return NextResponse.json({ error: 'Salesperson mobile number not set in profile' }, { status: 400 });
    }

    const provider = process.env.TELEPHONY_PROVIDER; // 'TWILIO' or 'EXOTEL'
    
    if (provider === 'TWILIO') {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_FROM_NUMBER;

      if (!sid || !token || !from) {
        return NextResponse.json({ error: 'Twilio env config missing' }, { status: 500 });
      }

      // Outbound call via Twilio
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: phoneNumber,
          From: from,
          Url: 'http://demo.twilio.com/docs/voice.xml'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ error: data.message || 'Twilio dial error' }, { status: 500 });
      }
      return NextResponse.json({ success: true, callSid: data.sid });
    } 
    
    if (provider === 'EXOTEL') {
      const sid = process.env.EXOTEL_ACCOUNT_SID;
      const apiKey = process.env.EXOTEL_API_KEY;
      const apiToken = process.env.EXOTEL_API_TOKEN;
      const callerId = process.env.EXOTEL_CALLER_ID;

      if (!sid || !apiKey || !apiToken || !callerId) {
        return NextResponse.json({ error: 'Exotel env config missing' }, { status: 500 });
      }

      // Outbound connection call salesperson <-> customer
      const res = await fetch(`https://api.exotel.com/v1/Accounts/${sid}/Calls/connect.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${apiKey}:${apiToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: salesperson.mobile,
          To: phoneNumber,
          CallerId: callerId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ error: data.RestResponse?.ErrorMessage || 'Exotel dial error' }, { status: 500 });
      }
      return NextResponse.json({ success: true, callSid: data.RestResponse?.Call?.Sid });
    }

    return NextResponse.json({ error: 'Telephony provider not configured in environment variables' }, { status: 400 });
  } catch (error) {
    console.error('Telephony dial error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
