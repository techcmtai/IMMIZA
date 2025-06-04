import { getDocument, updateDocument } from '@/lib/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { applicationId, agentId } = req.body;

    if (!applicationId || !agentId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and Agent ID are required',
      });
    }

    // Get the application
    const application = await getDocument('applications', applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check if application is already assigned to an agent
    if (application.agentId) {
      return res.status(400).json({
        success: false,
        message: 'Application is already assigned to an agent',
      });
    }

    // Get the agent
    const agent = await getDocument('users', agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }

    // Check if user is an agent
    if (agent.role !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Only agents can accept applications',
      });
    }

    // Update application with agent ID and information
    const updatedApplication = await updateDocument('applications', applicationId, {
      agentId,
      agentName: agent.username,
      agentEmail: agent.email,
      isAccepted: true,
      acceptedAt: new Date().toISOString(),
    });

    // Update agent's project count and accepted applications
    const projectCount = (agent.projectCount || 0) + 1;
    const acceptedApplications = [...(agent.acceptedApplications || []), applicationId];

    await updateDocument('users', agentId, {
      projectCount,
      acceptedApplications,
    });

    // We're not adding a status history entry for agent acceptance
    // Instead, we'll just store the agent information in the application

    return res.status(200).json({
      success: true,
      message: 'Application accepted successfully',
      application: updatedApplication,
      projectCount,
    });
  } catch (error) {
    console.error('Error accepting application:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
}
