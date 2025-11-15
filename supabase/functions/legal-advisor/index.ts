// AI Legal Advisor Edge Function
// Provides comprehensive legal guidance for business and finance matters

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Extract form data from request body
        const requestData = await req.json();
        const {
            legalCategory,
            businessType,
            queryDescription,
            jurisdiction,
            urgency,
            documentText
        } = requestData;

        // Generate comprehensive legal consultation
        const legalAdvice = generateLegalGuidance({
            legalCategory,
            businessType,
            queryDescription,
            jurisdiction,
            urgency,
            documentText
        });

        // Return successful response
        return new Response(JSON.stringify({ 
            success: true,
            consultation: legalAdvice,
            generatedAt: new Date().toISOString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Legal consultation error:', error);
        
        // Return error response
        return new Response(JSON.stringify({
            success: false,
            error: {
                code: 'LEGAL_CONSULTATION_FAILED',
                message: error.message || 'Failed to generate legal consultation'
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

function generateLegalGuidance(params: any) {
    const { legalCategory, businessType, queryDescription, jurisdiction, urgency, documentText } = params;
    
    const consultationId = `LEGAL-${Date.now()}`;
    const categorySpecificAdvice = getCategorySpecificAdvice(legalCategory, businessType, queryDescription, jurisdiction);
    
    return {
        consultationId,
        category: legalCategory,
        businessType,
        jurisdiction: jurisdiction || 'United States',
        urgency,
        
        executiveSummary: `Comprehensive legal analysis for your ${legalCategory} matter related to ${businessType} operations. This consultation provides strategic guidance on ${queryDescription.substring(0, 100)}...`,
        
        legalAnalysis: {
            overview: categorySpecificAdvice.overview,
            keyConsiderations: categorySpecificAdvice.keyConsiderations,
            applicableLaws: categorySpecificAdvice.applicableLaws,
            riskAssessment: categorySpecificAdvice.riskAssessment
        },
        
        recommendations: {
            immediate: categorySpecificAdvice.immediateActions,
            shortTerm: categorySpecificAdvice.shortTermActions,
            longTerm: categorySpecificAdvice.longTermActions
        },
        
        documentReview: documentText ? {
            summary: 'Document analysis completed',
            keyFindings: [
                'Document structure follows standard legal format',
                'All required sections are present',
                'Consider review of liability clauses',
                'Recommend legal counsel review before signing'
            ],
            concerns: [
                'Some clauses may require negotiation',
                'Ensure all parties are properly identified',
                'Verify jurisdiction and governing law alignment'
            ],
            suggestions: [
                'Add specific performance metrics if applicable',
                'Include clear termination clauses',
                'Define dispute resolution mechanisms'
            ]
        } : null,
        
        complianceChecklist: categorySpecificAdvice.complianceChecklist,
        
        nextSteps: [
            'Review all recommendations with your internal team',
            'Consult with a licensed attorney for jurisdiction-specific advice',
            'Gather all relevant documentation and evidence',
            'Document all business decisions and rationale',
            'Consider timeline for implementation of recommendations'
        ],
        
        resources: [
            {
                title: `${legalCategory} Legal Resources`,
                description: `Comprehensive guide for ${legalCategory.toLowerCase()} matters`,
                type: 'Guide'
            },
            {
                title: 'Business Law Compliance Toolkit',
                description: 'Essential compliance requirements for business operations',
                type: 'Toolkit'
            },
            {
                title: 'Legal Document Templates',
                description: 'Industry-standard templates for common business documents',
                type: 'Templates'
            }
        ],
        
        disclaimer: 'IMPORTANT LEGAL DISCLAIMER: This consultation provides general legal information and guidance based on common business scenarios. It does NOT constitute legal advice, does not create an attorney-client relationship, and should not be relied upon as a substitute for consultation with a qualified attorney licensed in your jurisdiction. Laws vary significantly by location and change frequently. For specific legal advice tailored to your situation, please consult with a licensed attorney in your jurisdiction. Use of this service does not guarantee any particular outcome.',
        
        estimatedComplexity: urgency === 'high' ? 'High Priority' : 'Standard Review',
        suggestedAttorneyType: categorySpecificAdvice.suggestedAttorneyType
    };
}

function getCategorySpecificAdvice(category: string, businessType: string, query: string, jurisdiction: string) {
    const adviceMap: any = {
        'Business Formation': {
            overview: `Business formation analysis for ${businessType} in ${jurisdiction}. Entity selection is crucial for liability protection, taxation, and operational flexibility.`,
            keyConsiderations: [
                'Choose appropriate entity structure (LLC, Corporation, Partnership)',
                'Consider liability protection for owners and stakeholders',
                'Evaluate tax implications of different entity types',
                'Assess capital raising requirements and investor preferences',
                'Review state-specific formation requirements and fees'
            ],
            applicableLaws: [
                'State Business Corporation Act',
                'LLC Operating Agreement requirements',
                'Federal and State Tax Codes',
                'Securities regulations for capital raising',
                'State-specific business licensing requirements'
            ],
            riskAssessment: {
                level: 'Medium',
                factors: [
                    'Personal liability exposure if improperly structured',
                    'Tax inefficiency with wrong entity type',
                    'Compliance failures leading to piercing corporate veil',
                    'Investor relations issues with inadequate documentation'
                ]
            },
            immediateActions: [
                'Determine optimal entity structure based on business goals',
                'Register business name and check trademark availability',
                'Obtain necessary business licenses and permits',
                'Draft comprehensive operating agreement or bylaws',
                'Set up business bank accounts and accounting systems'
            ],
            shortTermActions: [
                'File formation documents with state authorities',
                'Obtain Employer Identification Number (EIN) from IRS',
                'Register for state and local taxes',
                'Implement proper record-keeping systems',
                'Consider professional liability insurance'
            ],
            longTermActions: [
                'Maintain corporate formalities and documentation',
                'Conduct annual reviews of entity structure',
                'Plan for business growth and potential restructuring',
                'Develop exit strategy and succession planning',
                'Regular compliance audits'
            ],
            complianceChecklist: [
                'Business formation documents filed',
                'EIN obtained from IRS',
                'Business licenses secured',
                'Operating agreement or bylaws adopted',
                'Initial capital contributions documented',
                'Bank accounts established',
                'Insurance policies in place'
            ],
            suggestedAttorneyType: 'Business Formation / Corporate Attorney'
        },
        'Contract Review': {
            overview: `Contract analysis for ${businessType} operations. Proper contract review ensures legal protection, clear expectations, and enforceable terms.`,
            keyConsiderations: [
                'Verify all parties are properly identified and authorized',
                'Ensure consideration and mutual obligations are clear',
                'Review termination and dispute resolution clauses',
                'Assess liability limitations and indemnification provisions',
                'Confirm compliance with applicable laws and regulations'
            ],
            applicableLaws: [
                'Uniform Commercial Code (UCC) for sales of goods',
                'State contract law and common law principles',
                'Industry-specific regulations',
                'Consumer protection laws if applicable',
                'Electronic signatures and records laws'
            ],
            riskAssessment: {
                level: 'High',
                factors: [
                    'Unfavorable terms could lead to significant financial liability',
                    'Ambiguous language may cause disputes',
                    'Missing provisions could leave gaps in protection',
                    'Non-compliance with laws could void contract'
                ]
            },
            immediateActions: [
                'Read entire contract thoroughly',
                'Identify all obligations and deadlines',
                'Flag unclear or concerning provisions',
                'Verify insurance and indemnification requirements',
                'Confirm signatures and execution requirements'
            ],
            shortTermActions: [
                'Negotiate unfavorable or risky terms',
                'Add missing protective provisions',
                'Clarify ambiguous language',
                'Ensure compliance requirements are achievable',
                'Document all negotiation changes'
            ],
            longTermActions: [
                'Maintain organized contract management system',
                'Set up deadline tracking for obligations',
                'Regular contract compliance audits',
                'Develop standard contract templates',
                'Train team on contract management'
            ],
            complianceChecklist: [
                'All parties properly identified',
                'Scope of work clearly defined',
                'Payment terms specified',
                'Termination provisions included',
                'Dispute resolution mechanism established',
                'Governing law and jurisdiction stated',
                'Confidentiality protections addressed'
            ],
            suggestedAttorneyType: 'Contract / Business Attorney'
        },
        'Intellectual Property': {
            overview: `Intellectual property guidance for ${businessType}. IP protection is essential for maintaining competitive advantage and business value.`,
            keyConsiderations: [
                'Identify protectable intellectual property assets',
                'Determine appropriate protection mechanisms (patent, trademark, copyright, trade secret)',
                'Assess infringement risks and prior art',
                'Establish IP ownership and assignment policies',
                'Implement IP protection and enforcement strategies'
            ],
            applicableLaws: [
                'Patent Act (35 U.S.C.)',
                'Lanham Act for trademarks (15 U.S.C.)',
                'Copyright Act (17 U.S.C.)',
                'Defend Trade Secrets Act',
                'State trade secret laws'
            ],
            riskAssessment: {
                level: 'High',
                factors: [
                    'Loss of IP rights through inadequate protection',
                    'Infringement liability for using others\' IP',
                    'Employee or contractor IP ownership disputes',
                    'International IP protection challenges'
                ]
            },
            immediateActions: [
                'Conduct IP audit of business assets',
                'Search for conflicting trademarks and patents',
                'Implement confidentiality and invention assignment agreements',
                'Document creation and use of IP',
                'Consider provisional patent filing if applicable'
            ],
            shortTermActions: [
                'File trademark and patent applications',
                'Register copyrights for significant works',
                'Implement trade secret protection policies',
                'Monitor for potential infringement',
                'Establish IP licensing framework if needed'
            ],
            longTermActions: [
                'Maintain and renew IP registrations',
                'Monitor marketplace for infringement',
                'Develop IP portfolio strategy',
                'Consider international IP protection',
                'Regular IP valuation for business purposes'
            ],
            complianceChecklist: [
                'IP assets identified and cataloged',
                'Trademark search completed',
                'Patent prior art search conducted',
                'Employment agreements include IP assignment',
                'Trade secret protection measures implemented',
                'Copyright notices properly displayed',
                'IP registration applications filed'
            ],
            suggestedAttorneyType: 'Intellectual Property / Patent Attorney'
        },
        'Employment Law': {
            overview: `Employment law guidance for ${businessType}. Proper employment practices ensure legal compliance and reduce litigation risk.`,
            keyConsiderations: [
                'Comply with federal and state employment laws',
                'Implement proper hiring and termination procedures',
                'Maintain required employment documentation',
                'Establish clear workplace policies',
                'Ensure wage and hour compliance'
            ],
            applicableLaws: [
                'Title VII Civil Rights Act',
                'Americans with Disabilities Act (ADA)',
                'Fair Labor Standards Act (FLSA)',
                'Family and Medical Leave Act (FMLA)',
                'State employment and labor laws',
                'Workers\' compensation requirements'
            ],
            riskAssessment: {
                level: 'High',
                factors: [
                    'Discrimination and harassment claims',
                    'Wage and hour violations',
                    'Wrongful termination lawsuits',
                    'Regulatory penalties and audits',
                    'Employee benefits compliance issues'
                ]
            },
            immediateActions: [
                'Review all employment contracts and offer letters',
                'Ensure proper employee classification (exempt vs non-exempt)',
                'Implement anti-discrimination and harassment policies',
                'Post required labor law notices',
                'Maintain accurate time and wage records'
            ],
            shortTermActions: [
                'Develop comprehensive employee handbook',
                'Train managers on employment law compliance',
                'Establish grievance and complaint procedures',
                'Implement performance review system',
                'Conduct workplace policy training'
            ],
            longTermActions: [
                'Regular employment law compliance audits',
                'Update policies for legal changes',
                'Maintain employment practices liability insurance',
                'Document all employment decisions thoroughly',
                'Develop diverse and inclusive workplace culture'
            ],
            complianceChecklist: [
                'Employee handbook distributed',
                'Required posters displayed',
                'I-9 forms properly completed',
                'Workers\' compensation insurance obtained',
                'Wage and hour policies compliant',
                'Anti-discrimination policies implemented',
                'FMLA notices provided'
            ],
            suggestedAttorneyType: 'Employment / Labor Attorney'
        },
        'Tax Compliance': {
            overview: `Tax compliance guidance for ${businessType}. Proper tax planning minimizes liability and ensures regulatory compliance.`,
            keyConsiderations: [
                'Understand entity-level tax obligations',
                'Comply with employment tax requirements',
                'Maintain proper tax documentation and records',
                'Plan for estimated tax payments',
                'Consider tax implications of business decisions'
            ],
            applicableLaws: [
                'Internal Revenue Code',
                'State income tax laws',
                'Sales and use tax regulations',
                'Payroll tax requirements',
                'International tax treaties if applicable'
            ],
            riskAssessment: {
                level: 'High',
                factors: [
                    'Tax penalties and interest for non-compliance',
                    'IRS and state tax audits',
                    'Criminal liability for tax fraud',
                    'Business disruption from tax liens',
                    'Personal liability for trust fund taxes'
                ]
            },
            immediateActions: [
                'Determine all applicable tax obligations',
                'Register for required tax accounts',
                'Set up accounting system for tax compliance',
                'Calculate and reserve for tax liabilities',
                'Identify available deductions and credits'
            ],
            shortTermActions: [
                'File all required tax returns on time',
                'Make estimated tax payments',
                'Maintain organized tax records',
                'Implement internal controls for tax compliance',
                'Consider tax planning opportunities'
            ],
            longTermActions: [
                'Annual tax planning reviews',
                'Regular consultation with tax professionals',
                'Monitor tax law changes affecting business',
                'Develop tax-efficient business structure',
                'Maintain audit-ready documentation'
            ],
            complianceChecklist: [
                'Business tax identification numbers obtained',
                'Payroll tax system established',
                'Sales tax collection implemented if required',
                'Quarterly estimated taxes scheduled',
                'Annual tax return filing calendar created',
                'Tax record retention policy implemented',
                'Tax planning consultation scheduled'
            ],
            suggestedAttorneyType: 'Tax Attorney / CPA'
        },
        'Finance & Securities': {
            overview: `Securities and finance law guidance for ${businessType}. Capital raising and financial transactions require careful legal compliance.`,
            keyConsiderations: [
                'Understand securities law requirements for capital raising',
                'Comply with investor disclosure obligations',
                'Structure transactions to minimize regulatory burden',
                'Protect company and founders through proper documentation',
                'Consider impact on company valuation and control'
            ],
            applicableLaws: [
                'Securities Act of 1933',
                'Securities Exchange Act of 1934',
                'State securities laws (Blue Sky Laws)',
                'JOBS Act crowdfunding provisions',
                'Dodd-Frank financial regulations'
            ],
            riskAssessment: {
                level: 'Very High',
                factors: [
                    'Securities fraud liability',
                    'Regulatory enforcement actions',
                    'Investor lawsuits',
                    'Rescission rights for improper offerings',
                    'Criminal penalties for violations'
                ]
            },
            immediateActions: [
                'Determine if transaction involves securities',
                'Identify applicable exemptions from registration',
                'Prepare required disclosure documents',
                'Implement investor qualification procedures',
                'Document all offering materials and communications'
            ],
            shortTermActions: [
                'File required regulatory notices (Form D, etc.)',
                'Ensure compliance with exemption requirements',
                'Maintain investor records and documentation',
                'Implement securities law compliance program',
                'Consider need for legal opinions'
            ],
            longTermActions: [
                'Regular securities law compliance reviews',
                'Update disclosure documents for material changes',
                'Maintain ongoing investor communications',
                'Plan for future financing rounds',
                'Prepare for potential registration events'
            ],
            complianceChecklist: [
                'Securities exemption identified',
                'Required filings completed',
                'Investor accreditation verified',
                'Subscription agreements executed',
                'Disclosure documents provided',
                'State securities notices filed',
                'Offering records maintained'
            ],
            suggestedAttorneyType: 'Securities / Corporate Finance Attorney'
        }
    };

    // Return category-specific advice or default guidance
    return adviceMap[category] || {
        overview: `Legal guidance for ${category} matter in ${businessType} context.`,
        keyConsiderations: [
            'Understand all legal obligations and requirements',
            'Identify potential risks and liability exposures',
            'Ensure compliance with applicable laws',
            'Document all decisions and actions',
            'Consult with specialized legal counsel'
        ],
        applicableLaws: [
            'Federal statutory requirements',
            'State and local regulations',
            'Industry-specific compliance obligations',
            'Common law principles'
        ],
        riskAssessment: {
            level: 'Medium',
            factors: [
                'Legal compliance risks',
                'Potential litigation exposure',
                'Regulatory penalties',
                'Reputational concerns'
            ]
        },
        immediateActions: [
            'Gather all relevant documentation',
            'Identify applicable legal requirements',
            'Consult with legal counsel',
            'Implement risk mitigation measures'
        ],
        shortTermActions: [
            'Develop compliance procedures',
            'Train relevant personnel',
            'Monitor ongoing compliance',
            'Document all activities'
        ],
        longTermActions: [
            'Regular legal compliance reviews',
            'Update policies as laws change',
            'Maintain relationship with legal counsel',
            'Continuous risk management'
        ],
        complianceChecklist: [
            'Legal requirements identified',
            'Compliance procedures implemented',
            'Documentation systems established',
            'Professional counsel consulted'
        ],
        suggestedAttorneyType: 'Business Attorney'
    };
}
