module.exports = (req, res) => {
    console.log("session complete!")
    req.session.destroy()
    res.redirect("/guest-home")
    
}