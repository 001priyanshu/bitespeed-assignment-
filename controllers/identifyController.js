const Contact = require('../models/contact');
const { Op } = require('sequelize');

const fetchContactsByEmailOrPhone = async (email, phoneNumber) => {
  return await Contact.findAll({
    where: {
      [Op.or]: [
        email ? { email } : null,
        phoneNumber ? { phoneNumber } : null
      ].filter(Boolean)
    },
    order: [['createdAt', 'ASC']]
  });
};

const fetchLinkedContacts = async (contacts) => {
  const allContactIds = new Set();
  for (const contact of contacts) {
    allContactIds.add(contact.id);
    if (contact.linkedId) allContactIds.add(contact.linkedId);
  }

  return await Contact.findAll({
    where: {
      [Op.or]: [
        { id: [...allContactIds] },
        { linkedId: [...allContactIds] }
      ]
    },
    order: [['createdAt', 'ASC']]
  });
};

const buildResponse = (primaryContact, contacts) => {
  const emails = [...new Set(contacts.map(c => c.email).filter(Boolean))];
  const phoneNumbers = [...new Set(contacts.map(c => c.phoneNumber).filter(Boolean))];
  const secondaryContactIds = contacts
    .filter(c => c.linkPrecedence === 'secondary')
    .map(c => c.id);

  return {
    contact: {
      primaryContactId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds
    }
  };
};


exports.identifyContact = async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ message: 'Either email or phoneNumber is required.' });
  }

  try {
    const contacts = await fetchContactsByEmailOrPhone(email, phoneNumber);

    if (contacts.length === 0) {
      const newContact = await Contact.create({ email, phoneNumber, linkPrecedence: 'primary' });
      return res.status(200).json(buildResponse(newContact, [newContact]));
    }

    const linkedContacts = await fetchLinkedContacts(contacts);
    const primaryContact = linkedContacts.find(c => c.linkPrecedence === 'primary') || linkedContacts[0];

    const isDuplicate = linkedContacts.some(c => c.email === email && c.phoneNumber === phoneNumber);
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

    return res.status(200).json(buildResponse(primaryContact, updatedContacts));

  } catch (error) {
    console.error('❌ Error in /identify:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
