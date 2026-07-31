import React from "react";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
  const { i18n } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-24 pt-32">
      <h1 className="text-3xl font-bold mb-6 text-red-600">Privacy Policy</h1>
      <p className="mb-4 text-gray-700">
        Last updated:{" "}
        {new Date().toLocaleDateString(
          i18n.language === "ar" ? "ar-JO" : "en-US",
        )}
      </p>

      <div className="space-y-6 text-gray-800">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
          <p>
            Welcome to Shawermah Sheesh. We respect your privacy and are
            committed to protecting your personal data. This privacy policy will
            inform you as to how we look after your personal data when you visit
            our website or use our mobile application.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            2. The Data We Collect About You
          </h2>
          <p>
            We may collect, use, store and transfer different kinds of personal
            data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>
              <strong>Identity Data:</strong> includes first name, last name,
              username or similar identifier.
            </li>
            <li>
              <strong>Contact Data:</strong> includes billing address, delivery
              address, email address and telephone numbers.
            </li>
            <li>
              <strong>Transaction Data:</strong> includes details about payments
              to and from you and other details of products or services you have
              purchased from us.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            3. How We Use Your Personal Data
          </h2>
          <p>
            We will only use your personal data when the law allows us to. Most
            commonly, we will use your personal data in the following
            circumstances:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>
              Where we need to perform the contract we are about to enter into
              or have entered into with you (e.g. processing your food order).
            </li>
            <li>
              Where it is necessary for our legitimate interests (or those of a
              third party) and your interests and fundamental rights do not
              override those interests.
            </li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your
            personal data from being accidentally lost, used or accessed in an
            unauthorised way, altered or disclosed.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            5. Data Deletion & Account Erasure
          </h2>
          <p>
            You have the right to request the deletion of your personal data and
            account at any time. To request data deletion, please contact us at
            our provided support channels or email us, and we will securely
            erase your identity and transaction data from our active databases
            within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, our privacy
            practices, or wish to request data deletion, please contact us.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
