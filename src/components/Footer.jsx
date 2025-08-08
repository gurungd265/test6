export default function Footer() {
  return (
    <>
      {/* Footer */}
      <footer className="bg-white p-5 pb-20 shadow fixed bottom-0 w-full">
        <div className="container mx-auto grid grid cols-2 md:grid-cols-4 gap-4">
          <div>
            <h3 className="font-bold">About us</h3>
            <p className="text-sm">Information about CAL Market.</p>
          </div>
          <div>
            <h3 className="font-bold">Contacts</h3>
            <p className="text-sm">Contact details here.</p>
          </div>
          <div>
            <h3 className="font-bold">Our SNS</h3>
            <p className="text-sm">Social network links.</p>
          </div>
          <div>
            <h3 className="font-bold">Credits</h3>
            <p className="text-sm">Additional Information.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
