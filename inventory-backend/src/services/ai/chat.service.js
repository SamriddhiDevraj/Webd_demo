import mongoose from 'mongoose';
import Chat from '../../models/Chat.js';
import Sale from '../../models/Sale.js';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import callClaude, { callClaudeJSON } from './claude.js';

const validateQuery = (pipeline) => {
  const forbidden = ['$where', '$function', '$accumulator', '$out', '$merge'];
  const pipelineStr = JSON.stringify(pipeline);
  for (const op of forbidden) {
    if (pipelineStr.includes(op)) {
      throw new Error(`Forbidden operator in query: ${op}`);
    }
  }
  if (!pipeline[0]?.$match?.shopId) {
    throw new Error('Query must filter by shopId as first stage');
  }
  return true;
};

export const sendChatMessage = async (shopId, userId, userMessage) => {
  let chat = await Chat.findOne({ shopId, userId });
  if (!chat) {
    chat = await Chat.create({ shopId, userId, messages: [] });
  }

  const recentMessages = chat.messages.slice(-10);
  const historyContext = recentMessages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const step1System = `You are a MongoDB query generator for an inventory management system.
The user is the shop owner asking questions about their business data.
Generate a MongoDB aggregation pipeline to answer their question.

Database schema:
- Sales collection (sales): { shopId: ObjectId, productId: ObjectId, quantity: Number, unitPrice: Number, totalRevenue: Number, soldBy: ObjectId, soldAt: Date }
- Products collection (products): { shopId: ObjectId, name: String, sku: String, category: ObjectId, price: Number, costPrice: Number, quantity: Number, reorderThreshold: Number }
- Categories collection (categories): { shopId: ObjectId, name: String }

CRITICAL RULES:
1. First pipeline stage MUST be $match with shopId: { "$oid": "${shopId}" }
2. Only use read operations — absolutely NO $out, $merge, $set, $unset, $push, $pull at top level
3. Do NOT use $where, $function, or $accumulator (JavaScript execution is forbidden)
4. Return ONLY valid JSON: { "collection": "sales" | "products" | "categories", "pipeline": [...] }
5. No explanation, no markdown, no code blocks — raw JSON only
6. Start your response with { and end with }. Nothing before or after.`;

  const step1User = `${historyContext ? `Recent conversation:\n${historyContext}\n\n` : ''}User question: ${userMessage}

Respond with ONLY the JSON object. No explanation. No markdown.`;

  let queryData = [];

  try {
    const queryResult = await callClaudeJSON(step1System, step1User);

    if (!queryResult.collection || !Array.isArray(queryResult.pipeline)) {
      throw new Error('Invalid query structure from Claude');
    }

    validateQuery(queryResult.pipeline);

    const collections = { sales: Sale, products: Product, categories: Category };
    const Model = collections[queryResult.collection];

    if (!Model) throw new Error(`Unknown collection: ${queryResult.collection}`);

    queryData = await Model.aggregate(queryResult.pipeline);
  } catch (queryError) {
    queryData = [];
    console.error('Query failed, falling back to context-only:', queryError.message);
  }

  const step2System = `You are a friendly business analytics assistant for a small business owner.
The user asked a question about their shop data.
Format the provided query results as a clear, concise natural language response.
Use specific numbers, currency formatting ($), and percentages where helpful.
Keep the response conversational and actionable — 2-5 sentences maximum.
If the query returned no results, say so helpfully and suggest what might help.
Do not mention MongoDB, databases, queries, or technical terms.`;

  const step2User = `User question: "${userMessage}"

Query results from the database:
${JSON.stringify(queryData, null, 2)}

${queryData.length === 0 ? 'Note: No data was found for this query. Provide a helpful response anyway.' : ''}`;

  const assistantResponse = await callClaude(step2System, step2User, 512);

  chat.messages.push(
    { role: 'user',      content: userMessage,      createdAt: new Date() },
    { role: 'assistant', content: assistantResponse, createdAt: new Date() }
  );
  chat.updatedAt = new Date();
  await chat.save();

  return {
    message: assistantResponse,
    updatedHistory: chat.messages,
  };
};

export const getChatHistory = async (shopId, userId) => {
  const chat = await Chat.findOne({ shopId, userId });
  return chat?.messages || [];
};

export const clearChatHistory = async (shopId, userId) => {
  await Chat.findOneAndUpdate(
    { shopId, userId },
    { messages: [], updatedAt: new Date() }
  );
};
