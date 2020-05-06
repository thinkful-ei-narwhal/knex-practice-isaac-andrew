const knex = require('knex');
const shoppingListServices = require('../src/shopping-list-service');

describe('Shopping list services', () => {
	let db;

	let testItems = [
		{
			id: 1,
			name: 'banana',
			category: 'Breakfast',
			checked: false,
			price: '2.30',
			date_added: new Date('2029-01-22T16:28:32.615Z'),
		},
		{
			id: 2,
			name: 'apple',
			category: 'Breakfast',
			checked: false,
			price: '2.30',
			date_added: new Date('2029-01-21T16:28:32.615Z'),
		},
		{
			id: 3,
			name: 'grape',
			category: 'Lunch',
			checked: false,
			price: '2.30',
			date_added: new Date('2029-01-18T16:28:32.615Z'),
		},
	];

	before(() => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DB_URL,
		});
	});

	//hooks
	before(() => db('shopping_list').truncate());
	afterEach(() => db('shopping_list').truncate());
	after(() => db.destroy());

	context("Given 'shopping_list' has data", () => {
		beforeEach(() => {
			return db.into('shopping_list').insert(testItems);
		});

		it("getAllItems() resolves all items from 'shopping_list' table", () => {
			return shoppingListServices.getAllItems(db).then((actual) => {
				expect(actual).to.eql(testItems);
			});
		});

		it(`getById() resolves an item by id from 'shopping_list' table`, () => {
			const thirdId = 3;
			const thirdTestItem = testItems[thirdId - 1];
			return shoppingListServices.getById(db, thirdId).then((actual) => {
				expect(actual).to.eql({
					id: thirdId,
					name: thirdTestItem.name,
					checked: false,
					category: thirdTestItem.category,
					price: thirdTestItem.price,
					date_added: thirdTestItem.date_added,
				});
			});
		});

		it(`deleteItem() removes an item by id from 'shopping_list' table`, () => {
			const itemId = 3;
			return shoppingListServices
				.deleteItem(db, itemId)
				.then(() => shoppingListServices.getAllItems(db))
				.then((allItems) => {
					// copy the test articles array without the "deleted" article
					const expected = testItems.filter((item) => item.id !== itemId);
					expect(allItems).to.eql(expected);
				});
		});

		it(`updateItem() updates an item from the 'shopping_list' table`, () => {
			const idOfItemToUpdate = 3;
			const newItemData = {
				name: 'updated name',
				checked: false,
				category: 'Lunch',
				price: '100.20',
				date_added: new Date(),
			};
			return shoppingListServices
				.updateItem(db, idOfItemToUpdate, newItemData)
				.then(() => shoppingListServices.getById(db, idOfItemToUpdate))
				.then((item) => {
					expect(item).to.eql({
						id: idOfItemToUpdate,
						...newItemData,
					});
				});
		});
	});

	context(`Given 'shopping_list' has no data`, () => {
		it(`getAllItems() resolves an empty array`, () => {
			return shoppingListServices.getAllItems(db).then((actual) => {
				expect(actual).to.eql([]);
			});
		});
	});

	it(`insertItem() inserts an item and resolves the item with an 'id'`, () => {
		const newItem = {
			name: 'Bread',
			checked: false,
			category: 'Lunch',
			price: '10.20',
			date_added: new Date(),
		};
		return shoppingListServices.insertItem(db, newItem).then((actual) => {
			expect(actual).to.eql({
				id: 1,
				name: newItem.name,
				checked: newItem.checked,
				price: newItem.price,
				category: newItem.category,
				date_added: newItem.date_added,
			});
		});
	});
});
