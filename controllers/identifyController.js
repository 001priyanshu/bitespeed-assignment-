const Contact = require('../models/contact');
const { Op } = require('sequelize');

exports.identifyContact = async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ message: 'Either email or phoneNumber is required.' });
  }

  try {
    const contacts = await Contact.findAll({
      where: {
        [Op.or]: [
          email ? { email } : null,
          phoneNumber ? { phoneNumber } : null
        ].filter(Boolean)
      },
      order: [['createdAt', 'ASC']]
    });

    let primaryContact = null;
    let allLinkedContacts = [];

    if (contacts.length === 0) {
      const newContact = await Contact.create({ email, phoneNumber, linkPrecedence: 'primary' });
      return res.status(200).json({
        contact: {
          primaryContatctId: newContact.id,
          emails: [newContact.email],
          phoneNumbers: [newContact.phoneNumber],
          secondaryContactIds: []
        }
      });
    }

    const allContactIds = new Set();
    for (const contact of contacts) {
      allContactIds.add(contact.id);
      if (contact.linkedId) allContactIds.add(contact.linkedId);
    }

    allLinkedContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { id: [...allContactIds] },
          { linkedId: [...allContactIds] }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    primaryContact = allLinkedContacts.find(c => c.linkPrecedence === 'primary') || allLinkedContacts[0];

    const isDuplicate = allLinkedContacts.some(c => c.email === email && c.phoneNumber === phoneNumber);
    if (!isDuplicate) {
      await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: 'secondary',
        linkedId: primaryContact.id
      });
    }

    const updatedContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { id: primaryContact.id },
          { linkedId: primaryContact.id }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    const emails = [...new Set(updatedContacts.map(c => c.email).filter(Boolean))];
    const phoneNumbers = [...new Set(updatedContacts.map(c => c.phoneNumber).filter(Boolean))];
    const secondaryContactIds = updatedContacts
      .filter(c => c.linkPrecedence === 'secondary')
      .map(c => c.id);

    return res.status(200).json({
      contact: {
        primaryContatctId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds
      }
    });

  } catch (error) {
    console.error('❌ Error in /identify:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
