function FormulaireContact() {
  return (
    <form action="https://formspree.io/f/mjybbvrg" method="POST" className="newsletter-form">
      <input type="email" name="email" placeholder="Votre adresse e-mail" required />
      <button type="submit">S'abonner</button>
    </form>
  );
}

export default FormulaireContact;