import { getUsersByRole } from '@/lib/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { country, visaTypes } = req.body;

    if (!country || !visaTypes || !Array.isArray(visaTypes) || visaTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Country and visa types are required',
      });
    }

    // Get all existing employees
    const employees = await getUsersByRole('employee');

    // Check for conflicts with existing employees
    const conflicts = [];

    for (const employee of employees) {
      // Check if this employee has the same country
      if (employee.country === country) {
        // Check if there's any overlap in visa types
        const employeeVisaType = employee.visaType;
        const overlappingTypes = visaTypes.filter(type =>
          employeeVisaType && employeeVisaType.toLowerCase() === type.toLowerCase()
        );

        if (overlappingTypes.length > 0) {
          conflicts.push({
            employeeName: employee.username,
            country: country,
            conflictingVisaTypes: overlappingTypes
          });
        }
      }
    }

    if (conflicts.length > 0) {
      // Create a detailed error message
      const conflictMessages = conflicts.map(conflict => {
        const visaTypesList = conflict.conflictingVisaTypes
          .map(type => type.charAt(0).toUpperCase() + type.slice(1))
          .join(', ');
        return `${conflict.employeeName} already handles ${visaTypesList} visas for this country`;
      });

      return res.status(400).json({
        success: false,
        message: `Specialization conflict: ${conflictMessages.join('. ')}. Please select a different country or visa type combination.`,
        conflicts: conflicts
      });
    }

    // No conflicts found
    return res.status(200).json({
      success: true,
      message: 'Specialization is available',
    });

  } catch (error) {
    console.error('Error checking employee specialization:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check specialization availability',
      error: error.message,
    });
  }
}
