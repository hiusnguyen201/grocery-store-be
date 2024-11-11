import { Schema, Document, Query, Aggregate } from 'mongoose';

export type TWithSoftDeleted = {
  isDeleted: boolean;
  deletedAt: Date | null;
};

type TDocument = TWithSoftDeleted & Document;

const softDeletePlugin = (schema: Schema) => {
  // Add isDeleted and deletedAt fields to the schema
  schema.add({
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  // Define the Mongoose query types where you want to exclude soft-deleted records
  const typesFindQueryMiddleware = [
    'count',
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndRemove',
    'findOneAndUpdate',
    'update',
    'updateOne',
    'updateMany',
  ];

  // Function to soft delete a document by setting `isDeleted` and `deletedAt`
  const setDocumentIsDeleted = async (doc: TDocument) => {
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    await doc.save();
    return doc;
  };

  // Middleware to exclude soft-deleted documents in find queries
  const excludeInFindQueriesIsDeleted = async function (
    this: Query<TDocument, TDocument>,
  ) {
    this.where({ isDeleted: false });
  };

  // Middleware to exclude soft-deleted documents in aggregation queries
  const excludeInDeletedInAggregateMiddleware = async function (
    this: Aggregate<any>,
  ) {
    this.pipeline().unshift({ $match: { isDeleted: false } });
  };

  // Middleware to soft delete the document instead of removing it
  schema.pre('findOneAndDelete', async function () {
    return await this.model.findOneAndUpdate(
      this.getQuery(),
      { isDeleted: true, deletedAt: new Date() },
      { new: true, returnDocument: 'after' }, // Return the updated document after the soft delete
    );
  });

  // Attach the middleware to the appropriate query types
  typesFindQueryMiddleware.forEach((type) => {
    schema.pre(
      type as Parameters<typeof schema.pre>[0],
      excludeInFindQueriesIsDeleted,
    );
  });

  // Attach the middleware to aggregation queries
  schema.pre('aggregate', excludeInDeletedInAggregateMiddleware);
};

export { softDeletePlugin };
