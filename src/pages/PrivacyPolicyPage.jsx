import React from 'react';

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">プライバシーポリシー</h1>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">1. 個人情報の収集について</h2>
                <p className="text-gray-600 leading-relaxed">
                    当サイトでは、お客様にサービスをご利用いただく際に、氏名、メールアドレス、電話番号、住所などの個人情報を収集することがあります。これらの情報は、サービスの提供、お問い合わせへの対応、および当サイトの改善のために利用されます。
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">2. 個人情報の利用目的</h2>
                <p className="text-gray-600 leading-relaxed">
                    収集した個人情報は、以下の目的のために利用いたします。
                </p>
                <ul className="list-disc list-inside text-gray-600 ml-4 mt-2 space-y-1">
                    <li>ご注文いただいた商品の発送および関連するご連絡のため</li>
                    <li>お問い合わせやサポートへの対応のため</li>
                    <li>サービスに関する情報提供やご案内のため</li>
                    <li>当サイトのサービス改善および新サービスの開発のため</li>
                    <li>不正アクセスや不正利用の防止のため</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">3. 個人情報の第三者提供</h2>
                <p className="text-gray-600 leading-relaxed">
                    当サイトは、法令で認められる場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。ただし、商品の配送、決済処理、またはその他サービス提供に必要な範囲で、業務委託先に個人情報を提供する場合があります。この場合、委託先に対して適切な管理を義務付けます。
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">4. 個人情報の管理と保護</h2>
                <p className="text-gray-600 leading-relaxed">
                    当サイトは、収集した個人情報の漏洩、滅失、毀損等を防止するため、適切な安全管理措置を講じます。
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">5. クッキー（Cookie）について</h2>
                <p className="text-gray-600 leading-relaxed">
                    当サイトでは、サービスの利便性向上のため、クッキーを使用することがあります。クッキーにより個人を特定することはありません。ブラウザの設定でクッキーの利用を拒否することも可能ですが、その場合、一部サービスがご利用いただけない場合があります。
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">6. プライバシーポリシーの変更</h2>
                <p className="text-gray-600 leading-relaxed">
                    当サイトは、必要に応じて本プライバシーポリシーを改定することがあります。改定されたプライバシーポリシーは、当サイトに掲載された時点から効力を生じるものとします。
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">7. お問い合わせ</h2>
                <p className="text-gray-600 leading-relaxed">
                    プライバシーポリシーに関するご質問や個人情報の取り扱いに関するお問い合わせは、以下の連絡先までお願いいたします。
                </p>
                <p className="text-gray-600 mt-2">
                    [貴社の連絡先情報（例：メールアドレス、電話番号など）]
                </p>
            </section>

            <p className="text-sm text-gray-500 mt-8 text-right">
                最終更新日: 2025年7月31日
            </p>
        </div>
    );
}
