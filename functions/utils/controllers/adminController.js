const { db, admin } = require('../admin')
// const config = require('../configuration')

exports.adminPageEdits = (req, res) => {
  console.log(req.body)
  db
    .doc(`admin/${req.params.id}`)
    .update(req.body)
    .then(() => res.status(201).json({ message: 'page successfully updated' }))
    .catch(err => console.error(err))
}

exports.getAdminPageDetails = (req, res) => {
  console.log(req.body)
  db
    .doc(`admin/${req.params.id}`)
    .get()
    .then(data => res.status(201).json(data))
    .catch(err => console.error(err))
}

exports.createAwaitingVerification = (req, res) => {

  // console.log('verify', req)

  const verificationInfo = req.type === 'companyInfo' ? {
    userId: req.info.userId,
    verification: req.info.verification,
    name: req.info.name,
    company_registration_number: req.info.company_registration_number,
    accounts_contact_number: req.info.accounts_contact_number,
    accounts_email: req.info.accounts_email,
    vat_number: req.info.vat_number,
    professional_indemnity_insurance: req.info.professional_indemnity_insurance,
    public_liability_insurance: req.info.public_liability_insurance,
    documents: req.info.documents,
    type: req.type
  } :
    { userId: req.info.userId,
      name: req.info.name,
      coachInfo: req.info.coachInfo,
      verification: req.info.verification,
      message: '',
      type: req.type
    }

  // console.log(verificationInfo)

  // db.collection('awaitingVerification').add({
  //   userId: req.userId,
  //   name: req.name,
  //   documents: req.documents,
  //   verification: req.verification,
  //   message: ''
  // })
  return db.collection('/awaitingVerification').add(verificationInfo)
    .then(data => {
      db.doc(`/awaitingVerification/${data.id}`).update({
        verificationId: data.id
      })
      db.doc(`/users/${req.user}`).update({
        [`verificationId.${req.type}`]: data.id
      })
      res.status(201).json({ message: 'Document successfully uploaded', data: req.info })
      // return data
    })
    .catch(error => console.log(error))
}

exports.updateAwaitingVerification = (req, res) => {
  
  console.log(req.info.verificationId, req.type)

  const verificationInfo = req.type === 'companyInfo' ? {
    userId: req.info.userId,
    verification: req.info.verification,
    name: req.info.name,
    company_registration_number: req.info.company_registration_number,
    accounts_contact_number: req.info.accounts_contact_number,
    accounts_email: req.info.accounts_email,
    vat_number: req.info.vat_number,
    professional_indemnity_insurance: req.info.professional_indemnity_insurance,
    public_liability_insurance: req.info.public_liability_insurance,
    documents: req.info.documents,
    type: req.type
  } :
    { userId: req.info.userId,
      name: req.info.name,
      coachInfo: req.info.coachInfo,
      verification: req.info.verification,
      message: '',
      type: req.type
    }

  db.doc(`/awaitingVerification/${req.info.verificationId[req.type]}`).update({
    verificationInfo
  })
    .then(() => {
      res.status(201).json({ message: 'document updated!', data: req.info })
    })
    .catch(err => res.status(401).send(err))
}

exports.getVerifications = (req, res) => {
  console.log('hello')
  const data = []
  db.collection('awaitingVerification').get()
    .then(info => {
      console.log('info!')
      info.forEach(item => {
        console.log
        data.push([item.id, item.data()])
      })
      console.log(data)
      return res.status(201).json(data)
    })
    .catch(err => console.log(err))
}

exports.acceptAwaitingVerification = (req, res) => {
  // console.log(req.body)
  const updatedV = { ...req.body.updatedVerification }
  console.log('updated', updatedV)
  db.collection('awaitingVerification').doc(`${req.body.verificationId}`).delete()
    .then(() =>{
      db.doc(`/users/${req.body.userId}`).update({
        verification: { ...updatedV },
        [`verificationId.${req.body.type}`]: '',
        message: req.body.message
      })
      return res.status(201).json({ message: 'Documents successfully verified!' })
    })
}